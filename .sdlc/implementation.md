# Implementation: Edit and Delete User Functionality

**Branch:** feature/SCRUM-6-edit-delete-user
**Base:** main @ 5e4e5e1
**Jira:** SCRUM-6

## Commits
| SHA (short) | Message |
|---|---|
| de43ea7 | SCRUM-6: add UserFormModal and DeleteConfirmModal components |

> Note: App.jsx and test changes were included in the same commit as git staged all changes together — single logical unit.

## Changes by File
| File | Planned in PRD? | Summary of change |
|---|---|---|
| `src/UserFormModal.jsx` | Yes (Create) | Refactored from AddUserModal; accepts `mode` ('add'\|'edit'), `initialValues`, `onSave` props; heading and primary button label driven by mode; `key` prop pattern used at call site for state reset |
| `src/AddUserModal.jsx` | Yes (Delete) | Removed via `git rm`; replaced by UserFormModal |
| `src/DeleteConfirmModal.jsx` | Yes (Create) | Carbon Modal with `danger` variant; shows "Delete {user.name}? This action cannot be undone."; calls `onConfirm(user.id)` |
| `src/App.jsx` | Yes (Modify) | Added `editingUser`/`deletingUser` state; Actions column with Edit+Delete icon ghost buttons; `handleEditUser` (map/replace) and `handleDeleteUser` (filter); conditional rendering of both new modals |
| `src/test/AddUserModal.test.jsx` | Yes (Modify) | Updated import to point to `../UserFormModal` |
| `.sdlc/analysis.md` | N/A | Pipeline artifact — created by Phase 1 |
| `.sdlc/prd.md` | N/A | Pipeline artifact — created by Phase 2 |
| `.sdlc/progress.md` | N/A | Pipeline state — updated by orchestrator |

## Unplanned Changes
None. Every changed file is in the PRD table (or is a pipeline artifact).

## Decisions & Deviations

1. **`key`-based reset instead of `useEffect` for edit form state.** The linter (`eslint-plugin-react-hooks/set-state-in-effect`) flags `setState` called synchronously inside an effect body. The cleaner pattern: render `<UserFormModal key={editingUser.id} ...>` conditionally — React remounts the component fresh for each user, initializing state from props in `useState(...)` directly. No `useEffect` needed.

2. **Edit modal rendered conditionally (`{editingUser && <UserFormModal ...>}`).** Initially rendered as always-mounted with `isOpen={!!editingUser}`. Carbon renders both modal DOM nodes (both have `role="dialog"`) even when `open=false`, which broke the existing AC-2 test (`getByRole('dialog')` found multiple elements). Conditional rendering keeps only one dialog in the DOM at a time and avoids mounting overhead.

3. **`AddUserModal.test.jsx` not renamed.** The PRD listed deleting `AddUserModal.test.jsx` and creating `UserFormModal.test.jsx`. Since Phase 4 writes new tests, only the import was updated in the existing file to point at `UserFormModal`. Renaming the test file itself is left to Phase 4.

## Self-Review Results
| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | pass — 0 errors, 0 warnings |
| Type-check | N/A (no TypeScript) | N/A |
| Existing tests | `npm test` | 16/16 pass (baseline: 16/16) |
| Build | `npm run build` | pass — 894 modules, 248ms |
| Diff review | `git diff main...HEAD --stat` | 7 files; all in PRD table or pipeline artifacts; no debug code, no secrets, no TODOs |

## Fix Loops
None.

## Notes for Test Phase

- **Edit trigger:** Each user row has two `Button` elements accessible via `aria-label="Edit {user.name}"` and `aria-label="Delete {user.name}"`.
- **Edit modal:** Opens conditionally (`{editingUser && ...}`); heading is `"Edit User"`, primary button is `"Save"`. Fields are pre-populated from the selected user object.
- **Delete modal:** Opens conditionally (`{deletingUser && ...}`); heading is `"Delete User"`; body text is `"Delete {user.name}? This action cannot be undone."`. Confirm button is `"Delete"`, cancel is `"Cancel"`.
- **State reset for edit:** The `UserFormModal` component is keyed on `editingUser.id` — each distinct user gets a fresh mount, so form state is always pre-filled from `initialValues` on open.
- **AC-8 (shared component):** Both Add and Edit use `UserFormModal`. Add mode is driven by `isModalOpen`; Edit mode is driven by `editingUser !== null`.
