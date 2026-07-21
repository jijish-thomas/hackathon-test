# Analysis: Edit and Delete User Functionality

## Feature Request (verbatim)
introduce edit and delete functionality

## Codebase Summary

### Stack & Tooling
- **Framework:** React 19 + Vite 8 (ESM, `@vitejs/plugin-react`)
- **UI Library:** IBM Carbon Design System (`@carbon/react` v1.111, `@carbon/icons-react` v11.83, `@carbon/styles` v1.110, Sass)
- **State management:** Local `useState` in `App.jsx` — no global store, no router
- **Test runner:** Vitest v4 + Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`)
- **Linter:** ESLint 10 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`
- **Build:** `vite build`; no TypeScript

### Architecture Shape
- `src/main.jsx` — entry point, renders `<App />`
- `src/App.jsx` — single page: header, `TableContainer` with toolbar (Add User button) and user rows, hosts all state (`users`, `isModalOpen`)
- `src/AddUserModal.jsx` — Carbon `Modal` wrapping a `Form` with 5 `TextInput`/`Select` fields + inline validation
- `src/common/users.json` — seed data (5 users with id, name, email, role, location, status)
- `src/test/App.test.jsx` — integration tests against the full `<App />` tree
- `src/test/AddUserModal.test.jsx` — unit tests for the modal form component
- `src/test/setup.js` — jest-dom import + ResizeObserver polyfill

### Conventions to Follow
- Carbon components only (no custom HTML tables or forms)
- Component files at `src/` root level (flat, no sub-directories for components)
- Test files under `src/test/`, named `<Component>.test.jsx`
- `fireEvent` (not `userEvent`) used throughout existing tests
- Functional components with named exports at file bottom (`export default`)
- Inline validation: errors object keyed by field name, cleared field-by-field on change
- ID generation: `Math.max(...users.map(u => u.id)) + 1`

### Test & Build Commands
```
npm test          # vitest run — runs all tests once
npm run lint      # eslint .
npm run build     # vite build
```
**Baseline:** 16/16 tests pass, 0 failures. ✅

## Gap Analysis

### Touchpoints
| File | Change needed |
|---|---|
| `src/App.jsx` | Add Actions column to table; wire edit/delete state; render new shared modal and delete confirmation modal |
| `src/AddUserModal.jsx` | Refactor into `src/UserFormModal.jsx` — accept optional `initialValues` prop; update heading and primary button label dynamically |
| `src/test/App.test.jsx` | Add tests for edit and delete flows |
| `src/test/AddUserModal.test.jsx` | Rename/update to `src/test/UserFormModal.test.jsx`; add edit-mode tests |

### Prior Art
- `AddUserModal.jsx` already implements the full form + validation pattern. The edit form is identical — only the initial field values and modal heading/button label differ.
- `handleAddUser` in `App.jsx` is the direct pattern to follow for `handleEditUser` and `handleDeleteUser`.

### Missing Pieces
- No per-row action controls exist yet (no Edit/Delete buttons or Actions column)
- No "edit" state slot in `App.jsx` (need `editingUser` state)
- No delete confirmation modal component or state

### Constraints
- No backend — all mutations are in-memory `setState` calls only
- Must use Carbon components (`Modal`, `Button`, icon buttons from `@carbon/icons-react`)
- No TypeScript; follow existing plain JSX patterns
- Test pattern is `fireEvent` + `render`, not `userEvent`

## Clarifications

| # | Question | User's Answer | Impact on Design |
|---|---|---|---|
| 1 | Edit trigger: row click vs. per-row icon button | Default: per-row Edit icon button in a new Actions column | New "Actions" column added to table; uses Carbon `Button kind="ghost"` with `Edit` icon |
| 2 | Edit UI: reuse component or separate | Default: refactor into shared `UserFormModal` with `initialValues` prop | `AddUserModal.jsx` → `UserFormModal.jsx`; modal heading and primary button label driven by mode prop |
| 3 | Delete: immediate vs. confirmation modal | Default: Carbon Modal confirmation before delete | New `DeleteConfirmModal.jsx` (or inline state) triggered by Delete icon button |
| 4 | Fields editable in edit mode | Default: all five fields editable, same validation | No change to validation logic needed |
| 5 | Persistence after page refresh | Default: in-memory only | No localStorage or API work needed |

## Refined Requirement Statement

Add per-row Edit and Delete action buttons to the Users table inside a new Actions column. Clicking Edit opens a pre-filled Carbon Modal (refactored from the existing `AddUserModal` into a shared `UserFormModal`) where all five user fields can be modified with the same validation rules; saving updates the user in-memory. Clicking Delete opens a Carbon Modal asking for confirmation before removing the user from in-memory state. No persistence beyond the current page session is required.

## Out of Scope
- Backend API integration or localStorage persistence
- Bulk edit or bulk delete
- Row selection checkboxes (Carbon DataTable `<TableSelectRow>` pattern)
- Inline editing (editing directly in a table cell)
- Undo/redo after deletion
- Sorting, filtering, or pagination

## Risks & Unknowns
| Risk | Severity |
|---|---|
| Refactoring `AddUserModal` → `UserFormModal` breaks the 10 existing unit tests if props interface changes incompatibly | Medium — must ensure `isOpen`/`onClose`/`onAddUser` props remain backward-compatible or all call sites and tests are updated atomically |
| Carbon `Modal` cannot be opened twice simultaneously (edit + delete at same time) — must ensure only one modal open at a time | Low — simple with mutually exclusive state |
| `@carbon/icons-react` `Edit` and `TrashCan` icons must be available in the installed version (v11.83) | Low — both icons are stable Carbon icons present since v10 |
