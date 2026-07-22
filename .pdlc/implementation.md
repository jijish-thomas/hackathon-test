# Implementation: Edit and Delete User Functionality

**Branch:** feature/SCRUM-8-edit-delete-user
**Base:** main @ 5e4e5e1
**Jira:** SCRUM-8

## Commits
| SHA (short) | Message |
|---|---|
| dd7da4f | SCRUM-8: add DeleteConfirmModal danger confirmation component |
| c585837 | SCRUM-8: extend AddUserModal with initialUser prop and edit mode |
| 4ccd98e | SCRUM-8: add Actions column, edit/delete state and handlers, mount modals in App |
| e321fa0 | SCRUM-8: fix conditional modal mounting to avoid duplicate DOM dialogs |

## Changes by File
| File | Planned in PRD? | Summary of change |
|---|---|---|
| `src/DeleteConfirmModal.jsx` | Yes (new) | New Carbon `<Modal danger>` component accepting `isOpen`, `userName`, `onClose`, `onConfirmDelete` props. Heading renders "Delete {userName}?". |
| `src/AddUserModal.jsx` | Yes (modify) | Added `initialUser` and `onSaveUser` props. `isEditMode = Boolean(initialUser)`. `useState` initialiser reads from `initialUser` when present. Heading and primary button label are conditional on mode. `handleSubmit` calls `onSaveUser` in edit mode, `onAddUser` in add mode. Removed `useEffect` (replaced by `key`-driven remount — see Decisions). |
| `src/App.jsx` | Yes (modify) | Added `editingUser` and `deleteTargetId` state. Added `handleSaveUser` (map-replace) and `handleConfirmDelete` (filter-remove) handlers. Added "Actions" as 6th column heading. Each table row has Edit and Delete `<IconButton>` cells. Edit modal and Delete modal are conditionally rendered (not always mounted) — key pattern on edit modal ensures fresh `useState` on each open. |

## Unplanned Changes
None.

## Decisions & Deviations

1. **Conditional rendering over `open` prop for edit and delete modals**: Carbon keeps the Modal DOM node alive even when `open={false}`, causing Testing Library to find duplicate `role="dialog"` and duplicate `role="button" name="Add"` elements across the two simultaneously-mounted `AddUserModal` instances. Switching to `{editingUser && <AddUserModal ... />}` unmounts the modal entirely when not in use, eliminating the conflict while keeping the Add-mode modal's always-mounted behaviour unchanged (it was passing before and still does).

2. **`key` on edit-mode `AddUserModal`**: Since `useState` initialiser only runs once per mount, a `key={editingUser.id}` forces a fresh mount when a different user is selected for editing — ensuring the form is always pre-populated with the correct user's data without needing `useEffect`.

3. **Removed `useEffect` approach**: The initial plan used `useEffect` to sync `initialUser` into state. The project's ESLint config (`react-hooks/set-state-in-effect`) disallows synchronous `setState` inside effects. The `key`-driven remount is the correct idiomatic substitute and produces cleaner code.

4. **`deleteTarget` derived from `deleteTargetId`**: Rather than storing the full user object as delete target, we store only the id and derive `deleteTarget = users.find(u => u.id === deleteTargetId)`. This avoids holding a stale copy of the user object if the users array were ever updated while the confirmation is open.

## Self-Review Results
| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | pass — 0 errors, 0 warnings |
| Type-check | N/A — no TypeScript in this project | — |
| Existing tests | `npm test` | 16/16 pass (baseline: 16/16) |
| Build | `npm run build` | pass — 894 modules transformed, no errors |
| Diff review | `git diff main...HEAD --stat` | 3 files changed, 96 insertions(+), 8 deletions(−); all files in PRD table; no debug statements, no secrets, no TODOs without tickets |

## Fix Loops
One fix iteration during self-review:

**Fix 1 (lint):** ESLint `react-hooks/set-state-in-effect` rejected `setFields(...)` inside `useEffect`. Removed the effect; replaced with `useState` initialiser reading from `initialUser`, plus `key` prop in `App.jsx` to force remount on user change. This also resolved a downstream test failure where two simultaneously-mounted `AddUserModal` instances (one for add, one for edit) caused `getByRole('dialog')` and `getByRole('button', { name: /^Add$/i })` to find multiple matches.

## Notes for Test Phase
- Edit mode is entered by clicking the `IconButton` with `label="Edit {user.name}"` (e.g. `aria-label="Edit Ava Johnson"`). The edit `AddUserModal` mounts only when `editingUser` is non-null.
- Delete confirmation is entered by clicking the `IconButton` with `label="Delete {user.name}"`. The `DeleteConfirmModal` mounts only when `deleteTarget` is non-null.
- The edit modal's heading is "Edit User"; primary button is "Save".
- The delete confirmation modal heading is "Delete {userName}?" with a "Delete" danger button and "Cancel" secondary.
- After a successful edit, `users` state is updated by mapping over the array and replacing the matching id — the user retains their original `id`.
- After a confirmed delete, `users` state is updated by filtering out the matching id.
- Carbon `<IconButton>` renders with `aria-label` matching the `label` prop — queries should use `getByRole('button', { name: /Edit Ava Johnson/i })` etc.
