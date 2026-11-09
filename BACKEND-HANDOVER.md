# GT: single-session code walkthrough

Follow one request from login to the ranking, then visit the admin branches.
Open the files in the order below. Read the named function, follow its calls,
then return to the component to see how its result becomes UI.
This is a code-reading guide, not a deployment handbook or a list of every file.

For a live demonstration, use the demo emulators: normal development connects to
production unless `VITE_FIREBASE_EMULATORS=true`.

## The complete route

```text
main -> Firebase setup + AuthProvider -> Login -> AppRoutes
  -> Requests -> RequestModal -> useRequestForm -> createPointRequest
       -> Firestore: pending request
  -> Admin -> AdminRequests -> useRequestModeration -> approvePointRequest
       -> Firestore: approved request
  -> DepartmentPage -> useLeaderboard -> subscribeToLeaderboard
       -> aggregateApprovedRequests -> table rows

Admin branches: task editing | secretary/admin roles | transfer | score reset
```

These are execution paths, not one synchronous stack. Writes finish asynchronously;
`onSnapshot` callbacks receive later database changes and update React state.

## 1. Start: what mounts the application

| Open | Read this code | Understand before moving on |
| --- | --- | --- |
| [main.tsx](./src/main.tsx) | `createRoot(...).render(...)` | `BrowserRouter` supplies navigation; `AuthProvider` supplies identity; `AppRoutes` supplies the screen. |
| [firebase/config.ts](./src/firebase/config.ts) | `initializeApp`, `getAuth`, `getFirestore`, emulator condition | Every service uses this Firebase connection. `auth` handles login; `db` handles documents. |

## 2. Login: how identity reaches every screen

| Open | Read this code | Follow the result |
| --- | --- | --- |
| [Login.tsx](./src/pages/Login/Login.tsx) | `handleGoogleLogin` -> `signInWithPopup` | Firebase signs in the person; navigation returns them to the requested internal page. |
| [AuthContext.tsx](./src/contexts/AuthContext.tsx) | First effect: `onAuthStateChanged`; second effect: role `onSnapshot` calls | Login sets `user`, saves the member name, and loads admin/secretary assignments. |
| [roles.ts](./src/utils/roles.ts) | `resolveRoles`, `hasDepartmentAccess` | Role documents become one role and its department permissions. |
| [useAuth.ts](./src/contexts/useAuth.ts) | `useAuth` | Pages read the provider's shared state; they do not sign in or reload roles themselves. |
| [AppRoutes.tsx](./src/AppRoutes.tsx) | `useAuth`, signed-out/signed-in route branches, `departmentPages.map` | One route selects one page. FR/PR/HR/IT reuse the same department component. |

Follow the small navigation helpers only where called:
[ProtectedRoute](./src/components/ProtectedRoute.tsx) checks login,
[HomeRedirect](./src/components/HomeRedirect.tsx) chooses the home destination,
[Header](./src/layout/Header/Header.tsx) displays available links, and
[navigation.ts](./src/utils/navigation.ts) keeps login return URLs internal.

## 3. Create: follow the request button into a database write

| Open | Read this code | Follow the result |
| --- | --- | --- |
| [Requests.tsx](./src/pages/Requests/Requests.tsx) | `setIsModalOpen(true)` and the `RequestModal` props | The page opens the form and refreshes history after success. |
| [RequestModal.tsx](./src/components/RequestModal.tsx) | `useRequestForm(...)`, then the step buttons' handlers | The component renders the form; the hook owns its workflow. |
| [useRequestForm.ts](./src/hooks/useRequestForm.ts) | `handleDepartmentSelect` -> `handleTaskSelect` -> `handleNext` -> `handleSubmit` | Load tasks, select one, validate the event day/repetitions, submit. |
| [requestService.ts](./src/services/requestService.ts) | `createPointRequest` -> `addDoc` | A new `pointRequests` document stores owner, department, `taskId`, repetitions, date and `pending` status. No copied task price. |

At task loading, follow `getDepartmentTasks` into
[taskService.ts](./src/services/taskService.ts). For date limits, follow
[requestCalendar.ts](./src/utils/requestCalendar.ts). Form focus is isolated in
[useDialogFocus.ts](./src/hooks/useDialogFocus.ts), not submission logic.

## 4. History: follow the database result back into a card

| Open | Read this code | Follow the result |
| --- | --- | --- |
| [useRequests.ts](./src/hooks/useRequests.ts) | `useUserRequests`: `fetchInitialRequests`, `fetchMoreRequests`, `cancel` | Owns loaded records, the pagination cursor, loading/errors and refresh after cancellation. |
| [requestService.ts](./src/services/requestService.ts) | `getUserRequests` -> `getDocs` -> `readRequest`; `cancelRequest` -> `updateDoc` | Documents become typed requests. Cancellation changes status; it does not delete history. |
| [RequestCard.tsx](./src/pages/Requests/RequestCard.tsx) | Props from the page and child score/status components | The card displays data and calls the supplied cancel handler; it does not query Firestore. |

Trace the other outcomes of the same record: `pending -> cancelled` by its owner,
or `pending -> approved/rejected` by another authorized reviewer.

## 5. Review: follow an admin action through its transaction

| Open | Read this code | Follow the result |
| --- | --- | --- |
| [Admin.tsx](./src/pages/Admin/Admin.tsx) | `useAuth`, tab state, child components | This page chooses available features; each child owns its feature UI. |
| [AdminRequests.tsx](./src/components/admin/AdminRequests.tsx) | `useRequestModeration` and the approval/rejection handlers | UI actions go to the moderation hook, not straight to Firebase. |
| [useRequestModeration.ts](./src/hooks/useRequestModeration.ts) | `useAdminRequests`, `canReview`, `review` | Applies filters and prevents self-review; calls `requests.approve/reject`. |
| [useRequests.ts](./src/hooks/useRequests.ts) | `useAdminRequests`: `fetchRequests`, `approve`, `reject` | Loads scoped status records, performs the action, then reloads the list. |
| [requestService.ts](./src/services/requestService.ts) | `approveRequest` / `rejectRequest` | Small adapters pass the shared database and normalized reviewer email onward. |
| [requestReview.ts](./src/services/requestReview.ts) | `approvePointRequest` / `rejectPointRequest` -> `runTransaction` | Re-read the pending record; approval also reads its task. Write status/review metadata atomically, never a frozen score. |

## 6. Ranking: why an approval or task edit changes the score

| Open | Read this code | Follow the result |
| --- | --- | --- |
| [DepartmentPage.tsx](./src/pages/Department/DepartmentPage.tsx) | `useLeaderboard(department)` and table props | The same page displays whichever department the route supplies. |
| [useLeaderboard.ts](./src/hooks/useLeaderboard.ts) | Subscription effect, success/error callbacks, cleanup | Service updates become React state; leaving the page stops listening. |
| [leaderboardService.ts](./src/services/leaderboardService.ts) | `subscribeToLeaderboard`: subscriptions -> `listenForRequests` -> `publish` | Joins approved requests, current tasks, member names and reset cutoff; filters the academic year. |
| [scoring.ts](./src/utils/scoring.ts) | `aggregateApprovedRequests` -> `requestScore` -> `taskTotal` | Match by task ID and department; current points x repetitions; group by member and sort totals. Missing tasks contribute nothing. |
| [LeaderboardTable.tsx](./src/pages/Department/LeaderboardTable.tsx) | Rendered rows and sort callbacks | Calculated results become cells. Sorting changes presentation, not stored data. |

Follow the listener inputs once: [taskCatalog.ts](./src/services/taskCatalog.ts)
decodes live tasks; [memberService.ts](./src/services/memberService.ts) supplies
names. [useTasks.ts](./src/hooks/useTasks.ts) exposes the live catalog to history
and moderation, so their task names/prices also update.

## 7. Admin branches: trace each action once

Task editing renders its form inside the selected card; creation uses the same
form above the list. The save handler and Firebase write remain shared.

| Action | Open in this order | Code to follow / database effect |
| --- | --- | --- |
| Create/edit/delete task | [AdminTasks](./src/components/admin/AdminTasks.tsx) -> [useTaskEditor](./src/hooks/useTaskEditor.ts) -> [useTasks](./src/hooks/useTasks.ts) -> [taskService](./src/services/taskService.ts) | `save/remove` -> `create/update/remove` -> `addDoc/updateDoc/deleteDoc`. Rename/reprice updates the same ID; catalog listeners recalculate scores. |
| Secretary assignments | [AdminSecretaries](./src/components/admin/AdminSecretaries.tsx) -> [useSecretaries](./src/hooks/useSecretaries.ts) -> [secretaryService](./src/services/secretaryService.ts) | `add/remove` -> `addSecretary/removeSecretary` -> transaction; preserve assignments outside the admin's scope. |
| Grant admin access | [AdminSetup](./src/pages/AdminSetup/AdminSetup.tsx) -> [authService](./src/services/authService.ts) | `submit` -> `grantAdminRole` -> transaction merging department assignments. |
| Transfer admin access | [AdminTransfer](./src/pages/AdminTransfer/AdminTransfer.tsx) / [AcceptTransfer](./src/pages/AcceptTransfer/AcceptTransfer.tsx) -> [transferService](./src/services/transferService.ts) | Create invitation -> `acceptTransfer/rejectTransfer`. Acceptance reads invitation + both roles, then transfers the assignment atomically. |
| Reset rankings | [AdminScoringReset](./src/components/admin/AdminScoringReset.tsx) -> [useScoringReset](./src/hooks/useScoringReset.ts) -> [scoringResetService](./src/services/scoringResetService.ts) | `resetAll` -> `resetScores` -> save server cutoff. Return to `listenForRequests`: all four rankings now query `reviewedAt >= resetAt`; history stays intact. Explicit IT admins only. |

## 8. Finish at the database boundary

Keep [models/index.ts](./src/models/index.ts) beside the code when a data type is
unclear. Open [firestore.rules](./firestore.rules) at each collection's `match`
block and connect its `allow` conditions to the read/write you just traced.
UI checks explain available controls; rules decide whether Firebase permits the operation.

The main distinction to retain: **component = display; hook = state/action;
service = Firebase call; scoring utility = calculation; rules = authorization.**
