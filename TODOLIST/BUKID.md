Narito ang **TODO list** para sa pagpapabuti ng **Bukid (Farm Management) page**. Katulad ng ginawa natin sa Debt Management, nahahati ito sa **Frontend** at (kung kinakailangan) **Backend** tasks, may priority at dependency.

---

## 📋 TODO: Bukid Page Enhancements

### Priority Legend
- **P0** – Kailangan agad (core function)
- **P1** – Mahalaga, next na gagawin
- **P2** – Maganda kung may oras

---

## 🔧 Backend Tasks (kung kinakailangan)

### ✅ 1. Support `sortBy` and `sortOrder` in `getAllBukids`
- **File:** `src/services/BukidService.js` (findAll method)
- **Changes:**  
  Siguraduhin na ang `options.sortBy` at `options.sortOrder` ay gumagana para sa: `name`, `area`, `status`, `createdAt`, `session.name`.  
  Idagdag ang mapping para sa `session` (kailangan ng join).
- **Priority:** P0 (kung gusto ng sorting)
- **Dependency:** Wala

### ✅ 2. Support `limit` (page size) in `getAllBukids`
- **File:** `src/services/BukidService.js`
- **Changes:**  
  Tanggapin ang `options.limit` at gamitin sa `paginateQueryBuilder`.
- **Priority:** P0 (kung gusto ng page size selector)
- **Dependency:** Wala

### ✅ 3. Add `sessionId` filter in `getAllBukids`
- **File:** `src/services/BukidService.js`
- **Changes:**  
  Kung may `options.sessionId`, i‑filter ayon sa session.
- **Priority:** P0
- **Dependency:** Wala

### ✅ 4. (Optional) Include `pitaks` in `getAllBukids` response
- **File:** `src/services/BukidService.js`
- **Changes:**  
  Magdagdag ng `leftJoinAndSelect("bukid.pitaks", "pitaks")` para i‑include ang mga pitaks sa bawat bukid.  
  **Babala:** Pwedeng mabigat kung maraming pitaks. Pwedeng gawing optional via `options.includePitaks`.
- **Priority:** P1 (para hindi na kailangan ng separate API call sa frontend)
- **Dependency:** Wala

---

## 🎨 Frontend Tasks

### ✅ Phase 1: High Priority (P0)

#### 1. Summary Cards
- **New file:** `src/renderer/pages/farms/bukid/components/BukidSummaryCards.tsx`
- **Changes:**  
  - Gumawa ng component na tumatanggap ng `bukids` array (filtered) at nag‑compute ng:  
    - Total farms (count)
    - Active farms (status = `active`)
    - Completed farms (status = `completed`)
    - Total pitaks (sum of pitaks per farm)
    - Total luwang (sum of `area` na naka‑store as luwang)
  - I‑integrate sa `index.tsx` sa itaas ng filter bar.
- **Priority:** P0

#### 2. Page Size Selector
- **File:** `src/renderer/pages/farms/bukid/hooks/useBukids.ts` at `index.tsx`
- **Changes:**  
  - Magdagdag ng `limit` state (default 10).  
  - I‑update ang `fetchBukids` na gamitin ang `limit`.  
  - Sa UI, maglagay ng `PageSizeSelector` component sa tabi ng pagination.  
  - I‑sync sa URL (param `limit`).
- **Priority:** P0

#### 3. Sorting sa Table Headers
- **File:** `useBukids.ts` at `BukidTable.tsx`
- **Changes:**  
  - Magdagdag ng `sortBy` at `sortOrder` state.  
  - Sa `BukidTable`, gawing clickable ang headers: **Name**, **Total Luwang**, **Status**, **Session**.  
  - Kapag na‑click, i‑update ang params at mag‑refetch.  
  - I‑sync sa URL.
- **Priority:** P0

#### 4. Session Filter
- **New component:** `SessionSelect` (kung wala pa) o gamitin ang umiiral na `SessionSelect` mula sa `components/Selects/SessionSelect.tsx`.
- **Changes:**  
  - Magdagdag ng dropdown sa filter bar para pumili ng session.  
  - Idagdag ang `sessionId` sa filters state at sa API call.  
  - I‑sync sa URL.
- **Priority:** P0

#### 5. Export to CSV
- **New function:** `exportToCSV` sa `useBukids.ts`
- **Changes:**  
  - Tawagin ang `bukidAPI.getAll` na may `limit: 10000` at kasalukuyang filters.  
  - I‑convert ang resulta sa CSV format na may columns: ID, Name, Location, Status, Session, Total Luwang, Created At.  
  - I‑download bilang file.  
  - Magdagdag ng “Export CSV” button sa tabi ng “Add Farm” button.
- **Priority:** P0 (depende sa user requirement; kung hindi kailangan, P1)

---

### ✅ Phase 2: Medium Priority (P1)

#### 6. Bulk Actions (Select, Delete, Change Status)
- **File:** `useBukids.ts`, `BukidTable.tsx`, bagong `BulkActionsBar.tsx`
- **Changes:**  
  - Magdagdag ng checkbox column sa `BukidTable`.  
  - I‑store ang `selectedIds` state.  
  - Kapag may napili, magpakita ng `BulkActionsBar` na may:  
    - “Delete Selected” (confirmation)  
    - “Change Status” (dropdown ng allowed statuses)  
    - “Export Selected”  
  - I‑implement ang `bulkDelete` at `bulkStatusChange`.
- **Priority:** P1

#### 7. Quick “Add Pitak” from Actions Dropdown
- **File:** `BukidActionsDropdown.tsx` at `index.tsx`
- **Changes:**  
  - Magdagdag ng bagong action: **Add Plot** (icon: `PlusCircle`).  
  - Kapag na‑click, magbukas ng `PitakFormModal` na naka‑pre‑fill ang `bukidId`.  
  - Pagkatapos i‑save, i‑refresh ang bukid data.
- **Priority:** P1

#### 8. Expandable Row para sa Pitaks
- **File:** `BukidTable.tsx`
- **Changes:**  
  - Sa bawat row, magdagdag ng expand button (hal. `ChevronDown`).  
  - Kapag na‑expand, magpakita ng simpleng table ng pitaks (location, area, status) sa ilalim ng row.  
  - Pwedeng gumamit ng `useState` para i‑toggle ang expansion per row.
- **Priority:** P1
- **Dependency:** Backend #4 (kung gusto ng pre‑loaded pitaks) – kung wala, puwedeng i‑fetch ang pitaks ng farm sa pamamagitan ng `pitakAPI.getByBukid` kapag expand.

#### 9. Progress Indicator para sa Farm Completion
- **File:** `BukidTable.tsx`
- **Changes:**  
  - Sa bawat farm, i‑compute ang completion percentage = (bilang ng `completed` pitaks) / (kabuuang pitaks).  
  - Magpakita ng progress bar sa column ng “Status” o sa bagong column.  
  - Pwedeng small bar sa ilalim ng status badge.
- **Priority:** P1
- **Dependency:** Kailangan ng pitaks data per farm (Backend #4 o separate fetch)

---

### ✅ Phase 3: Low Priority / Nice-to-Have (P2)

#### 10. Duplicate Farm Action
- **File:** `BukidActionsDropdown.tsx`, `BukidFormModal.tsx`
- **Changes:**  
  - Magdagdag ng “Duplicate” action.  
  - Kapag na‑click, buksan ang `BukidFormModal` na may pre‑filled data mula sa source farm (palitan ang pangalan ng “Copy of ...”).  
  - I‑save bilang bagong farm.
- **Priority:** P2

#### 11. Activity Timeline sa View Modal
- **File:** `ViewBukidModal.tsx`
- **Changes:**  
  - Tawagin ang `auditLogAPI.getByEntity('Bukid', bukid.id)` para kunin ang status change history.  
  - Ipakita sa modal bilang listahan ng mga pagbabago.
- **Priority:** P2

#### 12. Inline Editing ng Name at Location
- **File:** `BukidTable.tsx`
- **Changes:**  
  - Gamit ang `contentEditable` o isang inline form, payagan ang user na i‑edit ang name at location nang hindi nagbubukas ng modal.  
  - I‑save sa pamamagitan ng API call kapag na‑blur.
- **Priority:** P2

#### 13. Map Integration
- **File:** `ViewBukidModal.tsx`
- **Changes:**  
  - Kung ang `location` ay may coordinates (lat, lon), magpakita ng static map thumbnail gamit ang Leaflet o Google Maps Static API.  
  - I‑link para magbukas sa full map.
- **Priority:** P2
- **Dependency:** Kailangan ng structured location field (hiwalay na `latitude`, `longitude`).

---

## 📅 Inirerekomendang Order ng Implementation

### Sprint 1 (2-3 araw)
- Summary cards (#1)
- Page size selector (#2)
- Sorting (#3)
- Session filter (#4)
- Export CSV (#5) – kung kailangan

### Sprint 2 (2 araw)
- Bulk actions (#6)
- Quick add pitak (#7)
- Expandable row (#8)

### Sprint 3 (opsyonal, kung may oras)
- Progress indicator (#9)
- Duplicate farm (#10)
- Activity timeline (#11)

---

## ✅ Checklist para sa bawat task

| Task | Backend | Frontend | Tested |
|------|---------|----------|--------|
| Summary cards | ⬜ | ✅ | ⬜ |
| Page size selector | ✅ (kung wala) | ✅ | ⬜ |
| Sorting | ✅ | ✅ | ⬜ |
| Session filter | ✅ | ✅ | ⬜ |
| Export CSV | ⬜ | ✅ | ⬜ |
| Bulk actions | ⬜ | ✅ | ⬜ |
| Quick add pitak | ⬜ | ✅ | ⬜ |
| Expandable row | ✅ (kung gusto i‑include sa API) | ✅ | ⬜ |
| Progress indicator | ✅ (kung gusto pre‑loaded) | ✅ | ⬜ |
| Duplicate farm | ⬜ | ✅ | ⬜ |
| Activity timeline | ⬜ | ✅ | ⬜ |

---

## 💡 Karagdagang Rekomendasyon

- **Optimization:** Kung maraming pitaks ang bawat bukid, i‑wasan ang pag‑load ng lahat ng pitaks sa `getAllBukids`. Mas magandang i‑load na lang kapag nag‑expand ang row (lazy loading).  
- **UI Consistency:** Gamitin ang mga umiiral nang components (e.g., `PageSizeSelector`, `SessionSelect`) para hindi na mag‑create ng bago.  
- **URL Sync:** Siguraduhin na ang lahat ng filters (search, status, sessionId, page, limit, sortBy, sortOrder) ay nase‑save sa URL para sa shareable links.

---

Kung aprubado itong TODO, pwede na tayong magsimula sa **Sprint 1**. Gusto mo bang i‑break down ko pa ang bawat task (hal. exact code changes) o okay na ito para sa planning?