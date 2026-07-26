# Re-render Analysis — `useState` & Context

An audit of unnecessary re-renders in the client, focused on Context providers
and `useState` usage. Findings are ordered by impact.

> **The one-line rule for Context:** a component re-renders whenever the
> *object identity* of the context `value` changes — **not** only when the data
> inside it changes. If `value={{ ... }}` is a fresh object literal every render,
> **every consumer re-renders every time the provider renders**, even if nothing
> they use actually changed.

---

## 1. 🔴 `AuthProvider` — new `value` object on every render (highest impact)

**File:** `src/auth/AuthProvider.jsx:102`

```jsx
return (
  <AuthContext.Provider value={{ user, setUser, loading, checkAuth, logout, authDisableEdit, isManager, isService, allowedPages }}>
    {children}
  </AuthContext.Provider>
);
```

### Why it's a problem
- The `value` is a **fresh object literal every render**, so all consumers of
  `useAuth()` re-render whenever `AuthProvider` renders — and this context is
  consumed almost everywhere: `Header`, `Layout`, `Sidebar`, `useApi`,
  and the `RequirePage` guard **on every route**.
- `logout` and `checkAuth` are **redeclared every render** (new function refs).
- `allowedPages` is a **new array rebuilt every render** (`AuthProvider.jsx:68-88`),
  as are `isManager` / `isService`. Even when `user` hasn't changed, these are
  recomputed and get new references.
- There are **two `useState` updates for one login** (`user` then
  `authDisableEdit` via the effect at `:95-97`), causing an extra render pass.

### What to do
1. Wrap the value in `useMemo`, and wrap `logout` / `checkAuth` in `useCallback`.
2. Derive `isManager` / `isService` / `allowedPages` with `useMemo` keyed on `user`.- done
3. Drop `authDisableEdit` as separate state — it's a pure function of `user`
   (`!isManager`), so derive it instead of storing it. This removes the extra render.

```jsx
const isManager = useMemo(() => !!user && MANAGER_ROLES.includes(user.role), [user]);
const isService = useMemo(() => !!user && SERVICE_ROLES.includes(user.role), [user]);
const allowedPages = useMemo(() => computeAllowedPages(user, isManager), [user, isManager]);
const authDisableEdit = !isManager; // derived, no state, no effect

const logout   = useCallback(async () => { /* ... */ }, []);
const checkAuth = useCallback(async () => { /* ... */ }, []);

const value = useMemo(
  () => ({ user, setUser, loading, checkAuth, logout, authDisableEdit, isManager, isService, allowedPages }),
  [user, loading, checkAuth, logout, authDisableEdit, isManager, isService, allowedPages]
);
```

### Bigger win — split the context
The value bundles *rarely-changing* data (`user`, roles, `allowedPages`) with
*actions* (`setUser`, `logout`, `checkAuth`). Consider **two contexts**:

- `AuthStateContext` → `{ user, loading, isManager, allowedPages, ... }`
- `AuthActionsContext` → `{ setUser, logout, checkAuth }` (never changes)

Components that only call `logout` (like `useApi`) then **never re-render**
on auth state changes, and vice-versa.

---

## 2. 🟡 Duplicated `locale` state between `AppProvider` and `I18nProvider`

**Files:** `src/components/AppProvider.jsx:36` and `src/i18n/I18nProvider.jsx:24-30`

`AppProvider` holds `locale` in state and passes it as `initialLocale` to
`I18nProvider`, which **copies it into its own `locale` state** and re-syncs via
an effect:

```jsx
// I18nProvider.jsx
const [locale, setLocale] = useState(initialLocale);
useEffect(() => { setLocale(initialLocale); }, [initialLocale]);
```

### Why it's a problem
- **Two sources of truth** for the same value. Changing language re-renders
  `AppProvider`, then re-renders `I18nProvider` with a new prop, then the effect
  fires `setLocale`, causing a **second render pass** of the whole subtree.
- `AppProvider`'s own `LanguageSwitcher` calls `AppProvider.setLocale`, but the
  actual UI language lives in `I18nProvider.setLocale` — the two can drift.

### What to do
Pick **one** owner of `locale`. Simplest: let `I18nProvider` own it entirely
(read the cookie in its `useState` initializer) and delete `AppProvider`'s
`locale` state and the sync effect. `LanguageSwitcher` already uses `useI18n()`,
so it keeps working.

> ✅ Note: `I18nProvider` itself is otherwise **well done** — `t` and `value` are
> both memoized on `locale` (`:52`, `:67`). Use it as the template for the others.

---

## 3. ✅ `List` is `React.memo`'d but rebuilds `listColumns` every render — DONE

**File:** `src/components/List.jsx:21-50, 100-109`

`List` is wrapped in `React.memo` (`:146`) — good intent — but:
- It builds a **new `listColumns` array every render** (`.map(...)` at `:21`,
  plus `.push(...)` at `:44`), then passes it to `DataTable`.
- In `DataTable`, the `sorted` `useMemo` depends on `columns`
  (`DataTable.jsx:89`), so a new array reference **defeats that memo** and
  re-sorts on every render.
- `React.memo` also only helps if the **parent passes stable props**. If pages
  pass inline `elements` / `onOpenItem` / `onClickItem` (new refs each render),
  the memo never bails out.

### What to do
- Memoize the columns: `const listColumns = useMemo(() => [...], [props.listColumns, hideActions, allowEdit, allowDelete])`.
- In the parent pages, wrap row callbacks in `useCallback` and derived arrays in
  `useMemo` so `React.memo(List)` can actually skip work.

> ✅ **Done.** Every list page now passes only referentially-stable props to
> `<List>`: `useCallback` for `fetch*` / `openModal` / `handleNew` / row-click &
> delete handlers, a module-level `INITIAL_SORT` constant instead of an inline
> object, and `useMemo` for `listColumns` (already) plus `CustomersList`'s
> `listHeaders`. Pages: `ProductsList`, `ServicesList`, `UsersList`,
> `TechniciansList`, `SupportAgentsList`, `MyCalls`, `CustomersList`.

---

## 4. 🟢 `DataTable` — `useState` initializers & effect deps (minor)

**File:** `src/components/DataTable.jsx`

- The `pageSize` initializer **writes a cookie inside `useState(() => ...)`**
  (`:29-38`). Side effects in a render/initializer are fragile under
  `StrictMode` (double-invoked in dev). Move the cookie write to an effect.
- The fetch effect (`:109-115`) depends on `[page, pageSize, sort, filter]` where
  `sort` and `filter` are objects. They're updated immutably, so this is OK, but
  be careful never to recreate them without a real change.

This component is mostly fine — listed for completeness.

---

## 5. 🟢 What's already correct (keep as reference patterns)

- **`BreadcrumbContext.jsx`** — textbook: `setLabel` in `useCallback`, `value` in
  `useMemo`, and `setLabels` **bails out when the label is unchanged** (`:14`).
- **`ConfirmProvider.jsx`** — `confirm` / `alert` are `useCallback`, `value` is
  `useMemo`'d to `{ confirm, alert }` (stable), so the confirm-modal state
  churning does **not** re-render consumers.
- **`I18nProvider.jsx`** — `t` and `value` correctly memoized (see #2 for the one
  wrinkle around duplicated state).

---

## Summary / Priority

| # | Area | Impact | Fix |
|---|------|--------|-----|
| 1 | `AuthProvider` value not memoized + derived-state churn | **High** | `useMemo`/`useCallback`; derive `authDisableEdit`; consider splitting state vs actions context |
| 2 | Duplicated `locale` state (AppProvider ↔ I18nProvider) | Medium | Single source of truth; delete the sync effect |
| 3 | `List` rebuilds columns; parents pass unstable props ✅ done | Medium | `useMemo` columns; `useCallback` parent handlers |
| 4 | `DataTable` cookie write in initializer | Low | Move side effect into an effect |
| 5 | Breadcrumb / Confirm / I18n providers | ✅ Good | Use as reference |

## General checklist to apply going forward
- [ ] Never pass a raw object/array/function literal as a context `value` — wrap in `useMemo`.
- [ ] Stabilize functions exposed through context/props with `useCallback`.
- [ ] **Derive** don't **store**: if a value can be computed from existing state, don't put it in its own `useState` + effect.
- [ ] Split "data that changes often" from "actions that never change" into separate contexts.
- [ ] `React.memo` only pays off when the parent passes **stable** props.
- [ ] Verify with **React DevTools → Profiler** ("Highlight updates when components render") before and after each change.
