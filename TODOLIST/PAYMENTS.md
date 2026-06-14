## 1. Business Requirements (Record Payment)

- A **payment** represents an actual cash transaction where a worker receives money (net pay), and optionally part of it is used to pay down their outstanding debt.
- The **status** of a payment (`pending`, `partially_paid`, `completed`) is **automatically derived** from the total amount paid so far versus the gross pay.
- The user will **never** manually change the status (except to `cancelled`). Instead, they record a payment with an amount.
- The system shall:
  - Increase the cumulative `amountPaid` of the payment.
  - If the user chooses, allocate a portion of the payment to reduce the worker’s debt (multiple debts are handled proportionally or FIFO – we'll define strategy).
  - Update the payment’s status:  
    - `completed` if `amountPaid >= grossPay`  
    - `partially_paid` if `amountPaid > 0` and `< grossPay`  
    - `pending` if no payment recorded yet.
  - Create a `PaymentHistory` entry for the transaction (type: `payment_recorded`).
  - Create one or more `DebtHistory` entries for each debt reduced.
  - Update the debt’s `balance` and potentially its status (`partially_paid` → `paid`).
  - Optionally, if the payment fully covers gross pay and also pays off debt, the worker gets net pay = 0 (but still recorded as a payment).
- The user can **cancel** a payment (set status to `cancelled`) which reverses any associated debt deductions and paid amounts? This should be restricted (maybe only allow cancellation if no payment recorded yet, or implement a reversal mechanism). We'll decide later.

---

## 2. Backend Changes

### 2.1 Database Additions

Add the following columns to the `payments` table:

| Column | Type | Description |
|--------|------|-------------|
| `amount_paid` | decimal(10,2) | Total amount paid so far (cumulative). Default 0. |
| `last_payment_date` | datetime | Most recent payment date. |
| `debt_deduction_total` | decimal(10,2) | Total amount deducted from debts across all payments. |

Alternatively, compute these on the fly from `PaymentHistory` to avoid redundancy. For performance, we can store them.

### 2.2 New Service Method

**File:** `services/PaymentService.js`

Add method:

```javascript
async recordPayment(paymentId, recordData, user, qr = null) {
  // recordData = {
  //   amountPaid: number,
  //   applyToDebt: number, // amount to deduct from debts (0 <= applyToDebt <= amountPaid)
  //   paymentMethod: string,
  //   referenceNumber?: string,
  //   notes?: string
  // }
  // Steps:
  // 1. Get payment with relations (worker, pitak, session)
  // 2. Validate that payment.status !== 'cancelled' and not already completed (or allow overpayment? No)
  // 3. Calculate new cumulative amountPaid = payment.amountPaid + recordData.amountPaid
  //    If newAmountPaid > grossPay, reject or adjust.
  // 4. Update payment:
  //    - amountPaid = newAmountPaid
  //    - lastPaymentDate = now
  //    - status = newAmountPaid >= grossPay ? 'completed' : 'partially_paid'
  //    - totalDebtDeduction = existing totalDebtDeduction + recordData.applyToDebt
  //    - netPay (recalculate: grossPay - manualDeduction - totalDebtDeduction)
  // 5. Call debt deduction logic (handleDebtDeduction)
  // 6. Create PaymentHistory entry (actionType: 'payment_recorded', oldAmount, newAmount, etc.)
  // 7. Audit log
  // 8. Return updated payment
}
```

### 2.3 Debt Deduction Logic

**New service:** `DebtService.deductFromWorker(workerId, amount, paymentId, sessionId, qr)`

- Fetch active debts for the worker (status `pending` or `partially_paid`), ordered by oldest first (or highest interest first – configurable).
- Distribute `amount` across debts until exhausted.
- For each debt:
  - Reduce balance.
  - Update debt status if balance becomes 0 (`paid`) else `partially_paid`.
  - Create `DebtHistory` entry linking to this payment.
- Return total deducted amount (should match `applyToDebt`).
- If `applyToDebt` > total outstanding debt, cap it and notify user.

### 2.4 New API Endpoint

**IPC Handler:** `payment/recordPayment`

- Called with `{ id, ...recordData }`
- Uses `handleWithTransaction` to wrap the call to `paymentService.recordPayment`.

---

## 3. Frontend Changes (UI/UX)

### 3.1 Payment Table Modifications

- **Remove** the "Change Status" action from the dropdown (keep only `View Details`, `Edit Payment`, `Delete`).
- Add a **new button** in the actions column: **Record Payment** (₱ icon or "Pay").
- Add a **checkbox** column for bulk actions.
- Add **sortable headers** for `Gross Pay`, `Net Pay`, `Amount Paid`, `Status`, `Last Payment Date`.
- Add columns: `Amount Paid`, `Last Payment Date`, `Debt Deduction Total`.

### 3.2 New Modal: RecordPaymentModal

**Purpose:** Capture a payment transaction.

**Fields:**
- `Amount Paid` (required, >0)
- `Apply to Debt` (number, default 0, max = min(amountPaid, totalOutstandingDebt))
- `Remaining Net to Worker` (display only: amountPaid - applyToDebt)
- `Payment Method` (dropdown: cash, bank_transfer, gcash, etc.)
- `Reference Number` (optional)
- `Notes` (optional)
- **Show worker’s current outstanding debt** (total remaining balance)
- **Optionally show breakdown of debts** (list with checkboxes to allocate to specific debts – advanced)

**Behavior:**
- When user changes `Amount Paid` or `Apply to Debt`, update `Remaining Net` in real time.
- Validate `Apply to Debt` does not exceed outstanding debt.
- On submit, call `paymentAPI.recordPayment(id, data)`.
- After success, refresh the table and show a success notification.

### 3.3 Summary Cards

Add 4 cards above the table:
- **Total Payments** (count of payments, maybe with a filter)
- **Total Gross Pay** (sum of grossPay of filtered payments)
- **Total Net Pay** (sum of netPay)
- **Total Debt Deducted** (sum of totalDebtDeduction)
- **Outstanding Debt** (sum of all worker debts in the current session – or filtered by worker)

Cards update based on current filters.

### 3.4 Filters (Enhanced)

- Quick date ranges: Today, This Week, This Month, Custom Range.
- Worker select (searchable).
- Status filter (pending, partially_paid, completed, cancelled) – for viewing, not changing.
- Payment Method filter.
- Min/Max amount (gross pay) filter.
- Search by worker name, pitak, reference number.

### 3.5 Bulk Actions

- **Bulk Record Payment** (open modal to record the same amount for multiple selected payments – careful: each payment may have different debts, so this is complex; maybe skip initially).
- **Bulk Delete** (only if status is pending and no payments recorded).
- **Bulk Export** (CSV of selected rows).

### 3.6 Export

- Button "Export CSV" exports all filtered payments (respecting current filters and pagination? Better export all matching rows, not just current page). Include columns: ID, Worker, Pitak, Gross Pay, Net Pay, Status, Amount Paid, Last Payment Date, Payment Method, Reference.

### 3.7 Pagination & Sorting

- Keep page size selector (10/25/50/100).
- Sorting applies to all columns; uses backend `sortBy` and `sortOrder`.

### 3.8 View Payment Modal (Extended)

Show:
- All payment details.
- **Transaction history** (list of recorded payments with dates, amounts, applied to debt, net to worker).
- **Debt deduction breakdown** (list of debts reduced with amounts and new balances).
- Audit trail (status changes, edits).

---

## 4. Business Rules & Edge Cases

- **Overpayment** – If user tries to record an amount that would make `amountPaid > grossPay`, reject with message: “Total amount paid cannot exceed gross pay.”
- **Partial payment with debt deduction** – The `applyToDebt` cannot exceed `amountPaid`. Also, `applyToDebt` cannot exceed total outstanding debt of the worker.
- **Cancellation** – If a payment is cancelled, any recorded payments should be reversed? This is complex. We will initially **disallow cancellation** if `amountPaid > 0`. User must delete the payment instead (if no child records). For payments that have recorded transactions, we can implement a `void` operation that reverses the debt deductions and resets amount paid, but that’s v2.
- **Multiple payments per payment record** – The same payment can have multiple recorded transactions (e.g., partial payments over time). The `amountPaid` is cumulative.
- **Debt allocation strategy** – For MVP, we’ll use **oldest debt first** (FIFO). Future: proportional, by interest rate, or user-selected.

---

## 5. Implementation Phases (Suggested)

### Phase 1 (Core)
- Backend: `recordPayment` method, debt deduction service, new endpoint.
- Database: add `amount_paid`, `last_payment_date`, `debt_deduction_total` to payments table.
- Frontend: RecordPaymentModal, remove manual status change, update table columns, basic filters.
- Testing: manual and unit tests for debt deduction.

### Phase 2 (Enhancements)
- Summary cards.
- Export CSV.
- Bulk actions (delete, export).
- Sorting/pagination enhancements.
- View modal with history.

### Phase 3 (Advanced)
- Bulk record payment (experimental).
- Debt allocation UI (choose which debts to pay).
- Void/cancellation with reversal.

---

## 6. UI Mockup (Text‑based)

```
+--------------------------------------------------------------------+
|  Worker Payments                                     [+ Create] [Export] |
|  Summary: [Total: 124] [Gross: ₱1.2M] [Net: ₱1.1M] [Debt Ded: ₱80k] |
+--------------------------------------------------------------------+
| Filters: [Search...] [Worker ▼] [Status ▼] [Date range...] [Clear] |
+--------------------------------------------------------------------+
| [ ] | Worker | Pitak | Gross | Paid | Debt Ded | Net | Status | Last Pay | Actions |
| [x] | Juan   | Plot A| 5000  | 2000 | 500      | 1500| partial|2025-03-01| [View] [Pay]|
| [ ] | Maria  | Plot B| 8000  | 8000 | 2000     | 6000|completed|2025-02-20| [View]      |
+--------------------------------------------------------------------+
| Bulk actions: [Delete] [Export]                                    |
| < 1 2 3 ... >   Show [25] per page                                |
+--------------------------------------------------------------------+
```

When clicking **Pay** on a row:
```
+-------------------------- Record Payment --------------------------+
| Payment #123 - Juan Dela Cruz                                      |
| Outstanding debt: ₱2,500                                           |
|                                                                    |
| Amount Paid (₱):   [ 2000  ]                                       |
| Apply to Debt (₱): [ 500   ]   (max 2000, debt:2500)               |
| Net to Worker:      ₱1500                                          |
| Payment Method:     [Cash ▼]                                       |
| Reference Number:   [ optional ]                                   |
| Notes:              [ optional ]                                   |
|                                                                    |
|                              [Cancel]  [Record Payment]            |
+--------------------------------------------------------------------+
```

---

## 7. Open Questions

1. Should we allow a payment to be recorded even if the worker has no outstanding debt? Yes, `applyToDebt` can be zero.
2. Should the system prevent recording a payment if the payment is already `completed`? Yes, show error.
3. Should we allow editing a recorded payment? Probably not; it’s an immutable transaction. Instead, create a void/correction entry.
4. How to handle `manualDeduction` in relation to debt deduction? Manual deduction is subtracted from gross pay regardless. Debt deduction is separate and reduces net pay further. We should keep them independent.

---

## Next Steps

- Approve the overall design.
- Decide on debt allocation strategy (FIFO for MVP).
- Finalise the database changes.
- Proceed with Phase 1 implementation (backend + frontend core).

Do you want me to now produce **technical specifications** for each component (e.g., exact API contract, database migration SQL, React component interfaces) or move directly to coding?

















