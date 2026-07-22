# Analysis: Edit and Delete User Functionality

## Feature Request (verbatim)
introduce edit and delete functionality

## Codebase Summary

### Stack & Tooling
- **Language:** JavaScript (JSX), no TypeScript
- **Framework:** React 19, Vite 8
- **UI library:** IBM Carbon Design System (`@carbon/react` v1.111, `@carbon/icons-react` v11.83, `@carbon/styles` v1.110, Sass)
- **Package manager:** npm
- **Test runner:** Vitest 4 with jsdom environment, `@testing-library/react`, `@testing-library/jest-dom`
- **Linter:** ESLint 10 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`
- **Build:** `vite build`
- **No TypeScript, no Prettier config found**

### Architecture Shape
- `src/main.jsx` — React DOM entry point
- `src/App.jsx` — root component; owns `users` state (loaded from JSON), renders Carbon Table + toolbar, mounts `AddUserModal`
- `src/AddUserModal.jsx` — Carbon Modal with a 5-field form (name, email, role, location, status); controlled form with inline validation
- `src/common/users.json` — seed data (5 users, fields: id, name, email, role, location, status)
- `src/test/App.test.jsx` — integration tests for Add User flow
- `src/test/AddUserModal.test.jsx` — unit tests for AddUserModal (validation, submit, cancel)
- `src/test/setup.js` — jest-dom import + ResizeObserver polyfill for jsdom

### Conventions to Follow
- Functional components only; no class components
- `useState` for local state; state lifted to `App` for shared concerns
- Carbon components used exclusively for UI (no raw HTML inputs, no third-party UI)
- Icon buttons sourced from `@carbon/icons-react`
- Inline form validation with per-field error messages rendered via Carbon `invalid`/`invalidText` props
- Test files in `src/test/`, named `<Component>.test.jsx`
- Tests use `fireEvent` (not `userEvent`) and `describe`/`it` blocks with AC-labelled comments
- No CSS modules; global `App.css` + Carbon style import

### Test & Build Commands
```
npm test          # vitest run — runs all tests once
npm run lint      # eslint .
npm run build     # vite build
```
**Baseline:** 16 tests across 2 files, all passing on `main`.

---

## Gap Analysis

### Touchpoints
| File | Change needed |
|---|---|
| `src/App.jsx` | Add Actions column to table; wire `handleEditUser` and `handleDeleteUser`; manage `editingUser` state and `isDeleteConfirmOpen` + `deleteTargetId` state; mount new modals |
| `src/AddUserModal.jsx` | Extend (or duplicate) to support an "Edit" mode: accept an optional `initialUser` prop, pre-populate fields, change heading/button label to "Save" |
| `src/test/App.test.jsx` | Add integration tests for edit and delete flows |
| `src/test/AddUserModal.test.jsx` | Add tests for pre-population and edit-mode submit |
| *(new)* `src/DeleteConfirmModal.jsx` | New Carbon danger Modal component for delete confirmation |
| *(new)* `src/test/DeleteConfirmModal.test.jsx` | Unit tests for delete confirmation modal |

### Prior Art
- `AddUserModal.jsx` is the direct template to follow for the edit modal (same field set, same validation, same Carbon Modal shell)
- Carbon `<Modal danger>` pattern is already imported in the project bundle (same `@carbon/react` package)
- `@carbon/icons-react` is already a dependency — `Edit` and `TrashCan` icons are available without adding packages

### Missing Pieces
- No edit or delete handlers exist in `App.jsx`
- No mechanism to pass an existing user into a modal for pre-population
- No delete confirmation modal component
- No Actions column in the table

### Constraints
- All state is in-memory (React `useState`); no persistence layer exists or is being added
- Must use Carbon components only — no raw `<button>` or `<input>` outside Carbon wrappers
- The `validate()` function in `AddUserModal.jsx` must remain the single source of truth for field validation; do not duplicate it in an edit variant

---

## Clarifications

| # | Question | User's Answer | Impact on Design |
|---|---|---|---|
| 1 | Should edit/delete use Carbon Modal (same pattern as Add User)? | Default: yes — Edit = pre-populated Carbon Modal, Delete = Carbon danger Modal | Both flows use `<Modal>` from `@carbon/react`; no new UI primitives needed |
| 2 | Where should Edit/Delete controls live in the table? | Default: Actions column with Edit + TrashCan icon buttons | Add a 6th column "Actions" to the table; icon buttons use `@carbon/icons-react` |
| 3 | Is delete immediate or does it require confirmation? | Default: confirmation step via Carbon danger Modal | A `DeleteConfirmModal` component is needed; delete only fires after user confirms |
| 4 | Are all 5 fields editable with the same validation? | Default: yes | `AddUserModal` is extended with an `initialUser` prop; `validate()` reused as-is |
| 5 | Persist to localStorage or in-memory only? | Default: in-memory (consistent with existing Add User) | No storage changes; edit/delete mutate the same `users` state array |

---

## Refined Requirement Statement

Add Edit and Delete actions to each row of the Users Directory table. Clicking the Edit icon button opens a pre-populated Carbon Modal (same 5 fields, same validation) allowing the user to save changes to that user's record in React state. Clicking the Delete icon button opens a Carbon danger Modal asking for confirmation; confirming removes the user from the in-memory state array. Both actions are reflected immediately in the table. No persistence beyond React state is introduced.

---

## Out of Scope
- Persistent storage (localStorage, API, backend)
- Bulk edit or bulk delete
- Undo / redo after delete
- Row selection checkboxes
- Sorting or filtering the table
- Any change to the Add User flow

---

## Risks & Unknowns
| Risk | Severity |
|---|---|
| Carbon `<Modal>` re-use for edit: need to verify that passing `initialUser` and resetting fields correctly on open/close does not leave stale state if the same modal instance is kept mounted | Medium |
| `fireEvent` vs `userEvent` — existing tests use `fireEvent`; new tests should follow the same pattern to avoid inconsistency | Low |
| Icon button accessibility: Carbon `IconButton` requires an `aria-label`; must be set correctly for test queries and screen readers | Low |
