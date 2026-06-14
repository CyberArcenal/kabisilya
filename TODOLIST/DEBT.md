## 📋 TODO: Debt Management Page Improvements

### Priority Legend
- **P0** – Kailangan agad (core function)
- **P1** – Mahalaga pero hindi kailangan agad
- **P2** – Maganda kung may oras

---

## 🔧 Backend Tasks

### ✅ 1. Disable manual status change to `paid`
- **File:** `src/services/DebtService.js` (updateStatus method)
- **Changes:**  
  Kapag ang request ay `newStatus = 'paid'`, dapat i‑validate kung `debt.balance === 0`. Kung hindi, mag‑throw ng error: `"Cannot mark as paid because balance is not zero. Please record payment first."`
- **Priority:** P0
- **Dependency:** Wala

### ✅ 2. Add sorting and pagination options to `getAllDebts`
- **File:** `src/services/DebtService.js` (findAll method)
- **Changes:**  
  Siguraduhin na ang `sortBy` at `sortOrder` ay gumagana para sa lahat ng column: `amount`, `balance`, `dueDate`, `status`, `interestRate`, `createdAt`, `lastPaymentDate`.  
  Suportahan ang `limit` (page size) mula sa request.
- **Priority:** P0
- **Dependency:** Wala

### ✅ 3. Enhance `payDebt` endpoint to accept `paymentMethod` and `referenceNumber`
- **File:** `src/services/DebtService.js` (payDebt method) at `src/main/ipc/debt/pay_debt.ipc.js`
- **Changes:**  
  Payload ng `payDebt` idagdag ang:  
  - `paymentMethod` (string, optional)  
  - `referenceNumber` (string, optional)  
  - `notes` (existing)
- **Priority:** P0
- **Dependency:** Wala

### ✅ 4. (Optional) Add endpoint for bulk debt payment
- **File:** `src/services/DebtService.js` (bulkPayDebts)
- **Changes:**  
  Tumanggap ng array ng `{ debtId, amount }` at i‑process sa isang transaction.  
  Para sa bulk actions sa frontend.
- **Priority:** P2
- **Dependency:** #3

---

## 🎨 Frontend Tasks

### ✅ 1. Remove `paid` option from `ChangeDebtStatusModal`
- **File:** `src/renderer/pages/finance/debts/components/ChangeDebtStatusModal.tsx`
- **Changes:**  
  Sa `getAvailableStatuses`, alisin ang `{ value: 'paid', label: 'Mark as Paid' }` sa lahat ng status.  
  I‑update ang logic para hindi na lumabas ang `paid`.
- **Priority:** P0
- **Dependency:** Backend #1

### ✅ 2. Enhance `RecordPaymentModal` with payment method and reference number
- **File:** `src/renderer/pages/finance/debts/components/RecordPaymentModal.tsx`
- **Changes:**  
  - Magdagdag ng dropdown para sa `Payment Method` (cash, bank_transfer, gcash, cheque)  
  - Magdagdag ng text field para sa `Reference Number` (optional)  
  - Ipadala ang mga ito sa `onPay` function.
- **Priority:** P0
- **Dependency:** Backend #3

### ✅ 3. Add summary cards above filters
- **New file:** `src/renderer/pages/finance/debts/components/DebtSummaryCards.tsx`
- **Changes:**  
  - Gumamit ng `debtAPI.getStats()` (kung available) o kumuha mula sa kasalukuyang filtered data.  
  - Ipakita ang: Total Debts, Total Balance, Overdue Count, Average Interest Rate.  
  - I‑integrate sa `index.tsx`.
- **Priority:** P1
- **Dependency:** Wala (data ay galing sa `debts` state)

### ✅ 4. Add page size selector
- **File:** `src/renderer/pages/finance/debts/hooks/useDebts.ts` at `index.tsx`
- **Changes:**  
  - Magdagdag ng `pageSize` state (default 10).  
  - I‑update ang `fetchDebts` para gamitin ang `limit = pageSize`.  
  - Sa UI, maglagay ng dropdown sa tabi ng pagination (gamit ang `PageSizeSelector` component).  
  - I‑sync sa URL (param `limit`).
- **Priority:** P1
- **Dependency:** Wala

### ✅ 5. Add sorting to table headers
- **File:** `src/renderer/pages/finance/debts/hooks/useDebts.ts` at `DebtTable.tsx`
- **Changes:**  
  - Magdagdag ng `sortBy` at `sortOrder` state.  
  - Sa `DebtTable`, gawing clickable ang headers: Amount, Balance, Due Date, Status, Interest Rate.  
  - Kapag na‑click, i‑update ang params at mag‑refetch.  
  - I‑sync sa URL.
- **Priority:** P1
- **Dependency:** Backend #2

### ✅ 6. Add CSV export
- **New function:** `exportToCSV` sa `useDebts.ts`
- **Changes:**  
  - Tawagin ang `debtAPI.getAll` na may `limit: 10000` at kasalukuyang filters.  
  - I‑convert ang resulta sa CSV format.  
  - I‑download bilang file.  
  - Magdagdag ng “Export CSV” button sa tabi ng “Create Debt” button.
- **Priority:** P1
- **Dependency:** Wala

### ✅ 7. Add bulk selection and bulk actions
- **File:** `src/renderer/pages/finance/debts/hooks/useDebts.ts`, `DebtTable.tsx`, bagong `BulkActionsBar.tsx`
- **Changes:**  
  - Magdagdag ng checkbox column sa `DebtTable`.  
  - I‑store ang `selectedIds` state.  
  - Kapag may napili, magpakita ng `BulkActionsBar` na may:  
    - “Record Payment” (para sa maramihan – popup modal na may isang amount)  
    - “Delete” (kung allowed)  
    - “Export Selected”  
  - I‑implement ang `bulkDelete` at `bulkRecordPayment`.
- **Priority:** P2
- **Dependency:** Backend #4 (kung gusto ng bulk payment endpoint)

### ✅ 8. Add advanced filters (payment method, reference number, last payment date range)
- **File:** `src/renderer/pages/finance/debts/components/DebtFilters.tsx` (bagong component)
- **Changes:**  
  - Ilipat ang kasalukuyang filters sa bagong component.  
  - Magdagdag ng expandable “Advanced Filters” section.  
  - Idagdag ang: Payment Method, Reference Number, Last Payment Date range.  
  - I‑update ang `useDebts` para suportahan ang mga bagong filter parameters.
- **Priority:** P2
- **Dependency:** Backend dapat suportahan ang mga bagong filter sa `findAll` (kung wala, idagdag).

### ✅ 9. Link debt payment to worker payment (optional)
- **File:** `RecordPaymentModal.tsx` at `useDebts.ts`
- **Changes:**  
  - Magdagdag ng dropdown na “Link to Worker Payment” – naglo‑load ng mga `Payment` records ng worker na ito (pending/completed).  
  - Kapag may napiling worker payment, ang `debtAPI.payDebt` ay magsasama ng `paymentId`.  
  - Sa backend, i‑link ang `DebtHistory.payment` sa Worker Payment na iyon.
- **Priority:** P2
- **Dependency:** Backend dapat tumanggap ng `paymentId` sa `payDebt`.

---

## 📅 Inirerekomendang Order ng Implementation

### Phase 1 (Core – 2-3 araw)
- Backend #1, #2, #3  
- Frontend #1, #2, #3, #4, #5

### Phase 2 (Enhancements – 2 araw)
- Frontend #6 (export), #7 (bulk selection), #8 (advanced filters – basic)

### Phase 3 (Advanced – kung may oras)
- Frontend #7 (bulk actions – full), #9 (link to worker payment)

---

## ✅ Checklist para sa bawat task

| Task | Backend | Frontend | Tested |
|------|---------|----------|--------|
| Disable manual `paid` status | ✅ | ✅ | ⬜ |
| Enhance `payDebt` with method/ref | ✅ | ✅ | ⬜ |
| Pagination size selector | ⬜ | ✅ | ⬜ |
| Sorting | ⬜ | ✅ | ⬜ |
| Summary cards | ⬜ | ✅ | ⬜ |
| CSV export | ⬜ | ✅ | ⬜ |
| Bulk actions | ⬜ | ✅ | ⬜ |
| Advanced filters | ✅ (kung wala) | ✅ | ⬜ |

---

Kung aprubado itong TODO, pwede na tayong magsimula sa Phase 1. Gusto mo bang i‑break down ko pa ang bawat task (hal. exact code changes) o okay na ito para sa planning?