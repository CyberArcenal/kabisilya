
## 📋 TODO: Pitak Page Enhancements

### Priority Legend
- **P0** – Must-have (performance & core usability)
- **P1** – Important, next sprint
- **P2** – Nice to have

---

## 🔧 Backend Tasks

### ✅ 1. Include workers (or assignments) in `getAllPitaks` response
- **File:** `src/services/PitakService.js` (findAll method)
- **Add:**  
  - `leftJoinAndSelect("pitak.assignments", "assignment")`  
  - `leftJoinAndSelect("assignment.worker", "worker")`  
  - Optionally make conditional via `options.includeWorkers` to avoid performance hit.
- **Why:** Frontend currently fetches all assignments separately (limit 1000) – slow as data grows.
- **Priority:** P0

### ✅ 2. Support `sortBy` and `sortOrder` in `getAllPitaks`
- **File:** `src/services/PitakService.js`
- **Allowed columns:** `location`, `bukid.name`, `totalLuwang`, `status`, `createdAt`
- **Priority:** P0

### ✅ 3. Support `limit` (page size) in `getAllPitaks`
- **File:** `src/services/PitakService.js`
- **Change:** Accept `options.limit` and pass to `paginateQueryBuilder`
- **Priority:** P0

### ✅ 4. Add area range filters (`minArea`, `maxArea`) in `getAllPitaks`
- **File:** `src/services/PitakService.js`
- **Where clause:** `pitak.totalLuwang >= minArea` and `<= maxArea`
- **Priority:** P1

---

## 🎨 Frontend Tasks

### Phase 1: High Priority (P0)

#### 1. Remove client-side worker enrichment
- **File:** `src/renderer/pages/farms/pitak/hooks/usePitaks.ts`
- **Change:** Delete the separate `assignmentAPI.getAll` call and `workersByPitak` map. Use `pitak.assignments` or `pitak.workers` from backend.
- **Priority:** P0

#### 2. Summary Cards
- **New file:** `src/renderer/pages/farms/pitak/components/PitakSummaryCards.tsx`
- **Show:** Total Plots, Active Plots, Completed Plots, Total Area (luwang), Total Assigned Workers
- **Integrate** above filters in `index.tsx`
- **Priority:** P0

#### 3. Page Size Selector
- **File:** `usePitaks.ts` and `index.tsx`
- **Add:** `limit` state, pass to API, sync with URL (`?limit=25`)
- **UI:** `PageSizeSelector` component near pagination
- **Priority:** P0

#### 4. Sorting on Table Headers
- **File:** `usePitaks.ts` and `PitakTable.tsx`
- **Add:** `sortBy`, `sortOrder` state, make headers clickable (Location, Farm, Area, Status)
- **Sync with URL** (`?sortBy=location&sortOrder=ASC`)
- **Priority:** P0

#### 5. Export to CSV
- **File:** `usePitaks.ts`
- **Function:** `exportToCSV` – fetch all (limit 10000) with current filters, generate CSV, download
- **Button:** Next to “Add Plot”
- **Columns:** ID, Location, Farm, Area (luwang), Status, Assigned Workers (count), Created At
- **Priority:** P0

---

### Phase 2: Medium Priority (P1)

#### 6. Bulk Actions (Select, Delete, Change Status)
- **File:** `usePitaks.ts`, `PitakTable.tsx`, new `BulkActionsBar.tsx`
- **Add:** Checkbox column, `selectedIds` state
- **Actions:** Delete, Change Status (dropdown), Export Selected
- **Implement:** `bulkDelete`, `bulkStatusChange`
- **Priority:** P1

#### 7. Area Range Filter
- **File:** `PitakFilters.tsx` and `usePitaks.ts`
- **Add:** Min Area, Max Area inputs (number, luwang)
- **Pass to API** as `minArea`, `maxArea`
- **Sync with URL**
- **Priority:** P1

#### 8. Fix Area Unit Inconsistency & Merge Duplicate Modals
- **File:** `PitakViewModal.tsx` and `ViewPitakModal.tsx`
- **Change:** Use `totalLuwang` instead of `area` (sqm) in both modals
- **Delete** the duplicate modal, keep one (`PitakViewModal.tsx`)
- **Priority:** P1

#### 9. “Assign Worker” Shortcut in Actions Dropdown
- **File:** `PitakActionsDropdown.tsx` and `index.tsx`
- **Add action:** “Assign Worker” (icon: `UserPlus`)
- **Open:** `CreateAssignmentModal` with `pitakId` pre‑filled
- **Priority:** P1

---

### Phase 3: Low Priority / Nice-to-Have (P2)

#### 10. Progress Indicator for Pitak Completion
- **File:** `PitakTable.tsx`
- **Compute:** % = completed assignments / total assignments
- **Show:** Progress bar below location or status
- **Priority:** P2

#### 11. Activity Timeline in View Modal
- **File:** `PitakViewModal.tsx`
- **Fetch:** `auditLogAPI.getByEntity('Pitak', pitak.id)`
- **Display:** List of status changes (old → new, date, user)
- **Priority:** P2

#### 12. Inline Editing of Location
- **File:** `PitakTable.tsx`
- **Change:** Make location cell `contentEditable` or double-click to edit
- **Save:** Call `pitakAPI.update` on blur
- **Priority:** P2

#### 13. Map Integration (if coordinates available)
- **File:** `PitakViewModal.tsx`
- **If** `pitak.latitude` and `pitak.longitude` exist, show static map thumbnail (Leaflet or Google Static)
- **Priority:** P2

---

## 📅 Recommended Order

### Sprint 1 (2–3 days)
- Backend #1, #2, #3
- Frontend #1, #2, #3, #4, #5

### Sprint 2 (2 days)
- Backend #4
- Frontend #6, #7, #8, #9

### Sprint 3 (optional)
- Frontend #10, #11, #12, #13

---

Do you want me to produce the **exact code changes** for any of these tasks, or is this TODO sufficient for planning?