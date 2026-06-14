## 📋 TODO: Worker Page Enhancements

### Priority Legend
- **P0** – Must-have (core usability)
- **P1** – Important, next sprint
- **P2** – Nice to have

---

## 🔧 Backend Tasks

### ✅ 1. Support `sortBy` and `sortOrder` in `getAllWorkers`
- **File:** `src/services/WorkerService.js` (findAll method)
- **Allowed columns:** `name`, `status`, `hireDate`, `createdAt`
- **Priority:** P0

### ✅ 2. Support `limit` (page size) in `getAllWorkers`
- **File:** `src/services/WorkerService.js`
- **Change:** Accept `options.limit` and pass to `paginateQueryBuilder`
- **Priority:** P0

---

## 🎨 Frontend Tasks

### Phase 1: High Priority (P0)

#### 1. Summary Cards
- **New file:** `src/renderer/pages/workers/components/WorkerSummaryCards.tsx`
- **Show:** Total Workers, Active, On Leave, Terminated
- **Integrate** above filters in `index.tsx`
- **Priority:** P0

#### 2. Page Size Selector
- **File:** `useWorkers.ts` and `index.tsx`
- **Add:** `limit` state (default 10), pass to API, sync with URL (`?limit=25`)
- **UI:** `PageSizeSelector` component near pagination
- **Priority:** P0

#### 3. Sorting on Table Headers
- **File:** `useWorkers.ts` and `WorkerTable.tsx`
- **Add:** `sortBy`, `sortOrder` state, make headers clickable (Name, Status, Hire Date)
- **Sync with URL** (`?sortBy=name&sortOrder=ASC`)
- **Priority:** P0

#### 4. Export to CSV
- **File:** `useWorkers.ts`
- **Function:** `exportToCSV` – fetch all (limit 10000) with current filters, generate CSV, download
- **Button:** Next to “Add Worker”
- **Columns:** ID, Name, Contact, Email, Address, Status, Hire Date, Created At
- **Priority:** P0

#### 5. Add Hire Date column to table
- **File:** `WorkerTable.tsx`
- **Add:** `<th>Hire Date</th>` and display formatted date or '—'
- **Priority:** P0

---

### Phase 2: Medium Priority (P1)

#### 6. Bulk Actions (Select, Delete, Change Status)
- **File:** `useWorkers.ts`, `WorkerTable.tsx`, new `BulkActionsBar.tsx`
- **Add:** Checkbox column, `selectedIds` state
- **Actions:** Delete, Change Status (dropdown), Export Selected
- **Implement:** `bulkDelete`, `bulkStatusChange`
- **Priority:** P1

#### 7. “Assign to Plot” Shortcut in Actions Dropdown
- **File:** `WorkerActionsDropdown.tsx`
- **Add action:** “Assign to Plot” (icon: `MapPin`)
- **Open:** `CreateAssignmentModal` (or navigate to Assignments page with worker pre‑filled)
- **Priority:** P1

---

### Phase 3: Low Priority / Nice-to-Have (P2)

#### 8. Activity Timeline in View Modal
- **File:** `ViewWorkerModal.tsx`
- **Add new tab:** “History” or integrate in existing tabs
- **Fetch:** `auditLogAPI.getByEntity('Worker', workerId)`
- **Display:** List of status changes (old → new, date, user)
- **Priority:** P2

#### 9. Inline Editing of Contact/Email
- **File:** `WorkerTable.tsx`
- **Make contact/email cells editable (double‑click) and save via API**
- **Priority:** P2

#### 10. Pagination in View Modal Tabs
- **File:** `ViewWorkerModal.tsx`
- **Add pagination for assignments, payments, debts tabs (instead of hard limit 100)**
- **Priority:** P2

---

## 📅 Recommended Order

### Sprint 1 (1-2 days)
- Backend #1, #2
- Frontend #1, #2, #3, #4, #5

### Sprint 2 (1 day)
- Frontend #6, #7

### Sprint 3 (optional)
- Frontend #8, #9, #10

---

✅ Ready to implement. Do you want me to produce the **exact code changes** for any of these tasks?