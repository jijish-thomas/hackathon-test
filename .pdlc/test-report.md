# Test Report: Edit and Delete User Functionality

**Branch:** feature/SCRUM-8-edit-delete-user @ 7ca11f4
**Jira:** SCRUM-8
**Run:** 2025-07-14T00:45:00Z | **Loop iteration:** 1

## Verdict: FAIL

## AC Coverage Matrix
| AC | Description (short) | Test(s) | Result |
|---|---|---|---|
| AC-1 | Actions column + Edit/Delete icon buttons per row | `App.test.jsx`: AC-1 (3 tests) | pass |
| AC-2 | Edit modal opens pre-populated with user data | `App.test.jsx`: AC-2 (3 tests), `AddUserModal.test.jsx`: AC-2 (7 tests) | **fail** (App integration: 2 tests) / pass (unit) |
| AC-3 | Edit modal validation same as Add | `AddUserModal.test.jsx`: AC-3 (2 tests) | pass |
| AC-4 | Valid edit updates table row, closes modal | `App.test.jsx`: AC-4 (3 tests), `AddUserModal.test.jsx`: AC-4 (2 tests) | **fail** (App integration: 2 tests) / pass (unit) |
| AC-5 | Delete button opens danger modal with user name + buttons | `App.test.jsx`: AC-5 (2 tests), `DeleteConfirmModal.test.jsx`: AC-5 (3 tests) | pass |
| AC-6 | Cancel closes modal, user stays | `App.test.jsx`: AC-6 (1 test), `DeleteConfirmModal.test.jsx`: AC-6 (1 test) | pass |
| AC-7 | Delete removes user row | `App.test.jsx`: AC-7 (2 tests), `DeleteConfirmModal.test.jsx`: AC-7 (1 test) | pass |
| AC-8 | Edited user retains original id | `AddUserModal.test.jsx`: AC-4&8 (2 tests) | pass |

## Suite Results
Total: 47 | Passed: 42 | Failed: 5 | Skipped: 0
Baseline comparison: Existing 16 tests still all passing — no regressions introduced.

## Failures

### Failure 1–2: AC-2 pre-population (App integration)
**Tests:** "pre-populates the Name field with the user's current name", "pre-populates Email, Role, and Location fields"
**Error:** `Found a label with the text of: /^Name/i, however the element associated with this label (<input />) is non-labellable`
**Cause:** `AddUserModal` hardcodes field `id` attributes (`user-name`, `user-email`, `user-role`, `user-location`, `user-status`). Both the Add-mode modal (always mounted with `isOpen={false}`) and the Edit-mode modal are simultaneously in the DOM, producing **duplicate ids**. When `within(editDialog).getByLabelText(/^Name/i)` resolves the `<label for="user-name">` to its associated element, it finds the `<input id="user-name">` from the **other** modal (which is outside the subtree), triggering "non-labellable".
**Diagnosis: implementation-bug** — the Add User modal should be conditionally rendered (just like the edit modal) or given distinct id prefixes to avoid duplicate ids in the DOM.

### Failure 3–4: AC-4 save updates row (App integration)
**Tests:** "updates the name cell for the edited user", "does not affect other user rows after an edit"
**Error:** Same root cause — `within(editDialog).getByLabelText(/^Name/i)` fails before the `fireEvent.change` can fire.
**Diagnosis: implementation-bug** — same duplicate id issue as above.

### Failure 5: AC-4 closes modal after save (App integration)
**Test:** "closes the edit modal after a valid save (Edit User dialog gone)"
**Error:** Cascades from failures 3–4 (the `fireEvent.change` and `click` never execute, so the modal is never submitted and never closes).
**Diagnosis: implementation-bug** — same duplicate id root cause.

## Required Implementation Fix
**File:** `src/App.jsx`
**Change:** Apply the same conditional rendering pattern to the Add User modal that is already applied to the Edit and Delete modals. Currently:
```jsx
<AddUserModal
  isOpen={isModalOpen}      // always mounted (isOpen=false doesn't unmount)
  ...
/>
```
Should be:
```jsx
{isModalOpen && (
  <AddUserModal
    isOpen
    onClose={() => setIsModalOpen(false)}
    onAddUser={handleAddUser}
  />
)}
```
This removes the duplicate id problem entirely. The existing Add User tests already pass and use the Carbon `is-visible` class to detect closed state — that test would need to be revisited after the change (AC-6 existing test checks `.cds--modal` class, not DOM presence).

## Manual Verification Steps
None — all ACs have automated test coverage.

## Flakiness Notes
None observed. Results consistent across two runs of the affected tests.

---

## Loop Iteration 2 — Fix Applied, Re-run

**Run:** 2025-07-14T00:55:00Z | **Branch:** feature/SCRUM-8-edit-delete-user @ 23f7993

### Fix Applied (implementation-bug)
- **`src/App.jsx`**: Changed Add User modal from always-mounted `<AddUserModal isOpen={isModalOpen} .../>` to conditionally rendered `{isModalOpen && <AddUserModal isOpen .../>}`. This eliminated duplicate `id` attributes in the DOM (two `AddUserModal` instances sharing the same `user-name`, `user-email` etc. ids), which was the root cause of all 5 test failures.
- **`src/test/App.test.jsx`**: Updated the pre-existing AC-6 test (`modal wrapper is no longer visible after successful submit`) to handle the case where the modal is now unmounted after submit (`null` return from `querySelector`). This is a test-bug fix — the assertion intent is preserved; the modal is definitely not visible when unmounted.

### Verdict: PASS

### Suite Results (Loop 2)
Total: 47 | Passed: 47 | Failed: 0 | Skipped: 0
Baseline comparison: All 16 original tests still passing — zero regressions.

### AC Coverage Matrix (Loop 2)
| AC | Tests | Result |
|---|---|---|
| AC-1 | App.test.jsx AC-1 (3 tests) | ✅ pass |
| AC-2 | App.test.jsx AC-2 (3 tests) + AddUserModal.test.jsx AC-2 (7 tests) | ✅ pass |
| AC-3 | AddUserModal.test.jsx AC-3 (2 tests) | ✅ pass |
| AC-4 | App.test.jsx AC-4 (3 tests) + AddUserModal.test.jsx AC-4 (2 tests) | ✅ pass |
| AC-5 | App.test.jsx AC-5 (2 tests) + DeleteConfirmModal.test.jsx AC-5 (3 tests) | ✅ pass |
| AC-6 | App.test.jsx AC-6 (1 test) + DeleteConfirmModal.test.jsx AC-6 (1 test) | ✅ pass |
| AC-7 | App.test.jsx AC-7 (2 tests) + DeleteConfirmModal.test.jsx AC-7 (1 test) | ✅ pass |
| AC-8 | AddUserModal.test.jsx AC-4&8 (2 tests) | ✅ pass |
