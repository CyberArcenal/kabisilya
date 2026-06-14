## 📋 TODO: Assignments Page Enhancements

### Priority Legend
- **P0** – Must-have (core usability)
- **P1** – Important, next sprint
- **P2** – Nice to have

---

## 🔧 Backend Tasks

### ✅ 1. Support `sortBy` and `sortOrder` in `getAllAssignments`
- **File:** `src/services/AssignmentService.js` (findAll method)
- **Allowed columns:** `worker.name`, `pitak.location`, `session.name`, `luwangCount`, `assignmentDate`, `status`
- **Priority:** P0

### ✅ 2. Support `limit` (page size) in `getAllAssignments`
- **File:** `src/services/AssignmentService.js`
- **Change:** Accept `options.limit` and pass to `paginateQueryBuilder`
- **Priority:** P0

---

## 🎨 Frontend Tasks

### Phase 1: High Priority (P0)

#### 1. Summary Cards
- **New file:** `src/renderer/pages/farms/assignments/components/AssignmentSummaryCards.tsx`
- **Show:** Total Assignments, Active, Completed, Total Luwang (sum of `luwangCount` of filtered assignments)
- **Integrate** above filters in `index.tsx`
- **Priority:** P0

#### 2. Page Size Selector
- **File:** `useAssignments.ts` and `index.tsx`
- **Add:** `limit` state (default 10), pass to API, sync with URL (`?limit=25`)
- **UI:** `PageSizeSelector` component near pagination
- **Priority:** P0

#### 3. Sorting on Table Headers
- **File:** `useAssignments.ts` and `AssignmentTable.tsx`
- **Add:** `sortBy`, `sortOrder` state, make headers clickable (Worker, Plot, Session, Luwang, Date, Status)
- **Sync with URL** (`?sortBy=assignmentDate&sortOrder=DESC`)
- **Priority:** P0

#### 4. Export to CSV
- **File:** `useAssignments.ts`
- **Function:** `exportToCSV` – fetch all (limit 10000) with current filters, generate CSV, download
- **Button:** Next to “Bulk Assign” / “Add Assignment”
- **Columns:** ID, Worker, Plot, Session, Luwang, Assignment Date, Status, Notes, Created At
- **Priority:** P0

---

### Phase 2: Medium Priority (P1)

#### 5. Bulk Actions (Select, Delete, Change Status)
- **File:** `useAssignments.ts`, `AssignmentTable.tsx`, new `BulkActionsBar.tsx`
- **Add:** Checkbox column, `selectedIds` state
- **Actions:** Delete, Change Status (dropdown), Export Selected
- **Implement:** `bulkDelete`, `bulkStatusChange`
- **Priority:** P1

#### 6. Quick Assign from Worker Page (cross‑page)
- **File:** Worker page actions dropdown → add “Assign to Plot” button
- **Open:** `CreateAssignmentModal` with pre‑filled `workerId`
- **Priority:** P1 (coordinate with Worker page)

---

### Phase 3: Low Priority / Nice-to-Have (P2)

#### 7. Activity Timeline in View Modal
- **File:** `ViewAssignmentModal` (shared component)
- **Fetch:** `auditLogAPI.getByEntity('Assignment', assignmentId)`
- **Display:** List of status changes (old → new, date, user)
- **Priority:** P2

#### 8. Inline Editing of Notes
- **File:** `AssignmentTable.tsx`
- **Make notes cell editable (double‑click), save via API**
- **Priority:** P2

#### 9. Progress bar for pitak luwang utilization
- **File:** `AssignmentTable.tsx`
- **Compute:** Percentage = assignment.luwangCount / pitak.totalLuwang (if available)
- **Show:** Small progress bar next to luwang count
- **Priority:** P2 (requires pitak.totalLuwang to be fetched)

---

## 📅 Recommended Order

### Sprint 1 (2 days)
- Backend #1, #2
- Frontend #1, #2, #3, #4

### Sprint 2 (1-2 days)
- Frontend #5, #6

### Sprint 3 (optional)
- Frontend #7, #8, #9

---

✅ Ready to implement. Do you want me to produce the **exact code changes** for any of these tasks?