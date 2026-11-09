# BEST Iasi Gamification Tool 2025-2026 (intern tool)
This is the repository for the BEST Iasi Gamification Tool 2025, a web application built using React and Vite.

## Prerequisites

- Node.js 22.18+ or 24 LTS (Node.js 23 is end-of-life)
- npm (version 10.9.2 or higher)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bestiasi/gamification-tool-2025-react.git
    cd <project-directory>
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm ci
    ```

3.  **Run the development server on local:**
    Using npm:
    ```bash
    npm run dev
    ```

    Open the URL shown in your terminal (e.g., http://localhost:xxxx) to view it in the browser.

## Contributor guide: where to change the code

Start at [main.tsx](./src/main.tsx), which mounts
[AppRoutes.tsx](./src/AppRoutes.tsx). Routes choose a page; pages compose smaller
components; hooks manage asynchronous state; services read or write Firebase.
Do not copy a page to add a department or duplicate a Firestore query in JSX.

| Change | Start here |
| --- | --- |
| Department URLs, navigation order, and request options | [constants/departments.ts](./src/constants/departments.ts) |
| Layout and tabs for GENERAL and the four departments | [DepartmentPage.tsx](./src/pages/Department/DepartmentPage.tsx) |
| Leaderboard rows and task catalog | [LeaderboardTable.tsx](./src/pages/Department/LeaderboardTable.tsx), [AvailableTasksTable.tsx](./src/pages/Department/AvailableTasksTable.tsx) |
| Table ordering and shared clickable headers | [sorting.ts](./src/pages/Department/sorting.ts), [SortableHeader.tsx](./src/pages/Department/SortableHeader.tsx) |
| Shared colors and composable controls | [tokens.css](./src/styles/tokens.css), [ui.module.css](./src/styles/ui.module.css) |
| Department styling and decoration | [DepartmentPage.module.css](./src/pages/Department/DepartmentPage.module.css), [DepartmentDecorations.tsx](./src/pages/Department/DepartmentDecorations.tsx) |
| Member history, filters, and pagination UI | [Requests.tsx](./src/pages/Requests/Requests.tsx) |
| A member's request card and status | [RequestCard.tsx](./src/pages/Requests/RequestCard.tsx), [RequestStatusBadge.tsx](./src/pages/Requests/RequestStatusBadge.tsx) |
| History loading, refresh, and cancellation state | [useUserRequests](./src/hooks/useRequests.ts) |
| New-request presentation | [RequestModal.tsx](./src/components/RequestModal.tsx) |
| New-request steps, task loading, validation, and submission | [useRequestForm.ts](./src/hooks/useRequestForm.ts) |
| Request date picker and academic-year calendar | [RequestDatePicker.tsx](./src/components/RequestDatePicker.tsx), [requestCalendar.ts](./src/utils/requestCalendar.ts) |
| Request queries and writes | [requestService.ts](./src/services/requestService.ts) |
| Shared transfer UI in the admin tab and standalone route | [AdminTransfer.tsx](./src/pages/AdminTransfer/AdminTransfer.tsx) |
| Transfer validation and atomic role handover | [transferService.ts](./src/services/transferService.ts) |
| Live roles, department assignments, and role-load errors | [AuthContext.tsx](./src/contexts/AuthContext.tsx) |
| Shared role interpretation and department checks | [roles.ts](./src/utils/roles.ts) |
| Admin route composition | [Admin.tsx](./src/pages/Admin/Admin.tsx) |
| Admin feature views | [components/admin](./src/components/admin) |
| Moderation, task editing, and secretary controllers | [useRequestModeration.ts](./src/hooks/useRequestModeration.ts), [useTaskEditor.ts](./src/hooks/useTaskEditor.ts), [useSecretaries.ts](./src/hooks/useSecretaries.ts) |
| Request-dialog focus, Escape, and restoration | [useDialogFocus.ts](./src/hooks/useDialogFocus.ts) |
| Safe return URLs after login | [navigation.ts](./src/utils/navigation.ts) |
| Score calculations and approval transactions | [scoring.ts](./src/utils/scoring.ts), [requestReview.ts](./src/services/requestReview.ts) |
| Live department standings and task catalog | [useLeaderboard.ts](./src/hooks/useLeaderboard.ts), [leaderboardService.ts](./src/services/leaderboardService.ts) |
| IT-admin global score reset | [ResetScoresButton.tsx](./src/components/admin/ResetScoresButton.tsx), [scoringResetService.ts](./src/services/scoringResetService.ts) |
| Live task names and prices in request history/admin | [useTaskCatalog](./src/hooks/useTasks.ts), [taskCatalog.ts](./src/services/taskCatalog.ts) |
| Shared data types | [models/index.ts](./src/models/index.ts) |

The department and request folders group their related UI together. Admin feature
views live in `components/admin`; the admin page composes those views, hooks
coordinate operations, and services own Firestore access. Keep names specific to
the feature rather than creating a generic "common" folder or a second MVC framework.

### Follow these contracts

- GENERAL and HR/PR/IT/FR use one department page, not separate copies.
  `leaderboardPages` puts GENERAL before FR/PR/HR/IT in navigation and routes.
  GENERAL combines the four departments by member; task descriptions carry their
  department prefix, for example `[IT] 3 x Tinut PV (15 puncte) = 45 puncte`.
  Request and task departments remain FR/PR/HR/IT only; the request service and
  Firestore creation rules enforce that restriction.
  All department tables support sorting through the full header area, with visible
  direction indicators and keyboard-operable buttons. HR retains its interactive
  decorations, not different sorting rules. Sorting survives tab switches and resets when
  visiting another department.
- Decoration records keep both image filenames, timing in seconds, and vertical
  positions in percent together. `interactiveTopPercent: null` omits a pair from
  HR's interactive layout. These are static visual settings, not Firebase data.
- `/requests` is the only member-history implementation. `/my-requests` redirects
  there for compatibility. Member and admin screens still have different jobs;
  do not combine their permissions into a large configurable card.
- `/` and login without a valid explicit destination lead to `/general` for every
  role. Valid internal destinations still take priority. Small local components in
  [AppRoutes.tsx](./src/AppRoutes.tsx) separate signed-out routes, signed-in routes,
  and role-load errors without deeply nested conditionals.
- Task editing opens inside the selected card and focuses its description.
  Creation still opens above the list. Both forms use the existing task editor;
  renaming or changing points updates the existing task document, not its ID.
- Request services convert Firestore timestamps to `Date` objects. Components
  format these dates; they must not call `.toDate()` on service results.
  Calendar-only `YYYY-MM-DD` strings are formatted as local calendar dates, not
  UTC timestamps; history and moderation use the same formatter.
- The auth context subscribes to both admin and secretary records. Header,
  home redirect, moderation, and transfer screens use that shared live role
  state. Failed role reads show an explicit retry screen, not a successful-looking
  member role. Login preserves an internal destination including its query/hash;
  external return URLs and login loops are rejected.
- Context and one-off role reads use the same role resolver. Empty assignments
  confer no privileges. Admins may grant/revoke only assignments in their own
  departments; updates preserve departments managed by other admins. Secretaries
  cannot change roles. `GENERAL` covers every department. These restrictions are
  enforced in Firestore rules, not just by hiding controls.
- Admins and secretaries cannot approve or reject their own requests. Another
  authorized department reviewer (or a GENERAL reviewer) must handle them; there
  is no single-admin bypass. Task writes are scoped to the admin's departments.
  `/admin/setup` grants access only for existing authorized admins. The first
  admin must be provisioned through a privileged Firebase Console/Admin SDK
  operation; members cannot bootstrap themselves.
- The request dialog contains focus, closes with Escape when not submitting,
  restores focus to its opener, and locks background scrolling while open.
  Admin request expansion uses native buttons with `aria-expanded` and a visible
  keyboard focus indicator. Score summaries own their styles rather than relying
  on admin CSS. Legacy admin selectors are scoped under `.admin-page`; filter
  widths, long record text, and task/secretary actions fit narrow layouts without
  depending on another feature's global classes.
- `GENERAL` expands to every department for request filters and secretary
  assignment. Tasks exist only in HR, PR, IT and FR, the departments members can
  request points in. A GENERAL role is transferred as a
  whole; it cannot be partially revoked by removing one concrete department.
- Both transfer entry points use the same UI and service. Accept/reject re-read
  the invitation inside a transaction, require the intended recipient and a
  pending, unexpired state, and cannot overwrite a terminal result. Acceptance
  atomically adds the recipient's assignment, removes the sender's assignment
  (deleting the admin document when no departments remain), and settles the
  invitation. `acceptedTransferId` on the receiving admin record binds those
  role writes to the same accepted invitation in Firestore rules.
  The URL entry point also validates its token. Missing parameters are an
  explicit error; stale screen data is never the authority for acceptance.
- Moderation and task reads discard obsolete responses after filter/navigation
  changes. Failures have visible retry controls and do not render empty-state
  success messages. An in-flight review cannot refresh an obsolete status filter.
- The new-request hook owns workflow state and asynchronous work. The modal only
  renders steps; the date picker owns its local open/month selection state.
  Calendar helpers are pure functions and preserve the September-to-today window.
- The history hook owns the pagination cursor and ignores obsolete reads after
  refresh/navigation. Cancellation refreshes the history instead of hiding the
  cancelled record. Counts and filters describe loaded records until all pages
  are loaded; database-wide counts/filtering are not implemented.
- New page styles use CSS Modules (`*.module.css`) so a class cannot restyle an
  unrelated screen. Keep global styles for the application shell only.
- Department and request UI share a small palette and composable classes:
  combine `ui.button` with `ui.primary`, `ui.secondary`, or `ui.danger`; use
  `ui.field` for inputs and `ui.surface` for panels. Feature modules own layout,
  not copies of button colors, borders, hover, disabled, or focus rules.
  The request modal and its calendar share one scoped stylesheet.
  Migrated pages also use `ui.page` to reserve the fixed header height. The legacy
  shell resets root padding, so removing that reservation hides content under the
  header. Do not change global root spacing until legacy pages are migrated too.
- Use `clamp()`, wrapping, and intrinsic grids for fluid dimensions. Keep media
  queries for actual mode changes and accessibility, such as the mobile menu
  and reduced motion. Do not remove those conditions just to reduce their count.
  Functional labels use plain text; the logos, palette, and quieter decorative
  images carry the playful identity.
- Route code loads on demand. The request wizard loads only when opened. Legacy
  global page styles remain eager to preserve their cascade until they can be
  scoped; migrated department/history styles load with their routes.
- Adding a route or hiding a button never grants or revokes Firebase permissions.
  Rules, role workflows, and new department support require their own tests.

Run `npm run build` for TypeScript and production-bundle checks. Regression
tests and their tooling are kept in a separate local workspace, not committed
as application dependencies or npm scripts. **The normal development server still uses live Firebase:
do not test writes against real accounts/data without explicit authorization.**

## Deployment

Pull requests and pushes to `main` run lint, unit tests, Firestore rules tests and
end-to-end tests. Pushes to `main` then deploy the Firestore rules and indexes
(secret `FIREBASE_SERVICE_ACCOUNT`) before uploading the frontend to Hostinger over
FTPS. Without that secret the rules step is skipped with a warning, and the rules
must be deployed by hand: `npx.cmd firebase deploy --only firestore:rules,firestore:indexes --project s2ws2w`.

The score-reset change requires the updated rules **before** the frontend:
rankings now read `scoringSettings/global`, even when that document does not exist.
No new index is required. Already-open older frontends ignore this cutoff; reload
them when releasing the reset feature.

## Firebase backend

There is no custom backend server or Cloud Functions implementation in this
repository. React calls Firebase Authentication and Cloud Firestore directly.
Firestore holds `members`, `pointRequests`, `departmentTasks`, `admins`,
`secretaries`, `adminTransfers`, and `scoringSettings/global`. Firebase Storage is initialized, but `storage.rules` denies
all access. Firebase Hosting configuration exists; the active deployment workflow
uses Hostinger instead.

### Data model: one source of truth per fact

| Fact | Stored only in |
| --- | --- |
| Who a person is | Their lowercased, verified `@bestis.ro` email: `pointRequests.userEmail`, role and member document ids, transfer emails |
| Display name | `members/{email}.name`, written by the person at login |
| Roles | `admins/{email}` and `secretaries/{email}`, holding only `departments` (plus `acceptedTransferId` during a transfer) |
| Task text and points | `departmentTasks/{id}`; requests store only `taskId` and `taskNumber`, so scores always use current points |
| Instants | Firestore server timestamps (`createdAt`, `reviewedAt`, `cancelledAt`) |
| Event day | `eventDate` as a `YYYY-MM-DD` string, a calendar day without a time zone |
| Transfer expiry | Derived: `createdAt` + 24 hours; never stored |
| Season | Derived: the academic year starting 1 September. Rankings count only approved requests dated in it; older pending requests read as cancelled and the rules refuse new or reviewed ones dated before it |
| Manual score cutoff | `scoringSettings/global.resetAt` and `resetBy`; only admins explicitly assigned IT can write the server timestamp and their own email |
| Limits (points, repetitions, departments, domain, transfer lifetime) | `VALIDATION`/`departments.ts` in the app and the matching functions at the top of `firestore.rules`; `src/constants/rulesParity.test.ts` fails if they differ |

### Resetting scores without deleting history

The admin panel shows the reset button only to admins explicitly assigned `IT`.
A GENERAL-only admin, IT secretary, or member cannot reset; Firestore rules
enforce this independently of the button. Confirmation resets GENERAL and all
four department rankings together.

The action writes the exact server reset instant, not midnight. Rankings retain
the academic-year event-date filter and count only requests whose approval time
(`reviewedAt`) is at or after this cutoff. An older pending submission can count
when approved after the reset. Tasks, prices, requests, and history are untouched.
Without a reset document, the existing academic-year calculation applies.

The cutoff is applied to the already-loaded approved history; it does not reduce
Firestore reads. This is separate from wiping or migrating the database.

### Resetting the production database

`scripts/firestore-reset.mjs` backs up, wipes and seeds Firestore with the Admin
SDK, which bypasses the rules. It uses your own login from `npx firebase login`
(or a service-account key if `GOOGLE_APPLICATION_CREDENTIALS` is set):

```text
npx firebase login
node scripts/firestore-reset.mjs backup
node scripts/firestore-reset.mjs wipe --yes-delete-everything
node scripts/firestore-reset.mjs seed-admin first.admin@bestis.ro
```

`backup` writes `backups/` (git-ignored, it contains personal data). The rules let
only existing admins appoint admins, so `seed-admin` creates the first GENERAL
admin. With `FIRESTORE_EMULATOR_HOST` set, the script targets the local emulator.

Backend behavior can be managed from code:

- Version and test Firestore rules and indexes.
- Test document reads/writes, pagination, role decisions, and concurrent workloads
  with the local Emulator Suite.
- Implement transactions for multi-document operations, such as admin transfers.
- Add a trusted backend using Cloud Functions or Cloud Run for privileged
  operations, scoring, validation, and scheduled work. These are not currently
  implemented and generally require a billing-enabled project.
- Write authenticated Admin SDK migration/maintenance scripts. The Admin SDK
  bypasses Firestore rules, so production scripts need separate authorization,
  explicit project selection, dry runs, backups, and credentials outside Git.

Rules and indexes can be deployed with the local Firebase CLI after authorized
login and explicit target selection:

```text
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes --project <staging-project-id>
```

Production deployment, data migrations, authentication-provider settings, IAM,
quotas, and billing require access to the actual Firebase/Google Cloud project;
checking in configuration alone does not update those resources.

## Scoring policy and release requirements

- Every approved request uses the task's **current** points multiplied by positive
  integer repetitions. Editing task points retroactively recalculates past work.
- New requests reference a task only by `taskId`; they do not copy its description,
  points, or approval-time award fields. Department, repetitions, ownership, dates,
  and review metadata remain on the request. Existing copied labels and award
  fields are ignored; no request documents are rewritten during score reads.
- The approval transaction requires an existing same-department task ID, valid
  repetitions/date, and a safely representable current total. It writes only the
  status and review metadata, not a stored score.
- A request can leave `pending` only once. Approvals, rejections, and cancellation
  cannot overwrite one another, and settled task IDs/repetitions cannot be edited by
  client SDK operations.
- GENERAL, all four department pages, the shared service, and request/admin score summaries
  use one scoring implementation. Repetition counts and line-item totals agree.
  Task summaries group by ID and use the current catalog name/rate; task-count
  sorting counts completed repetitions, not the number of task groups.
- Missing/unknown task IDs and tasks belonging to a different department are
  excluded from counting. Deleting a task removes all of its contributions.
  Exclusion does not delete requests; the leaderboard reports the excluded count.
  IDs are never inferred from old descriptions, even when a name is unique.
- Malformed repetitions on requests with valid task IDs are excluded and listed
  for manual review, not guessed or repaired automatically. Legacy records with
  no repetition field retain the original default of one; new requests require
  an explicit positive integer. No historical point estimates are used.
- Leaderboards show academic-year totals, further restricted by the global
  approval-time cutoff after an IT-admin reset. No historical records are rewritten.
- Each mounted department view listens to approved requests and its task catalog.
  New approvals, task-point edits, renames, and deletions update the displayed
  scores and ordering without a refresh. History/admin also listen to the catalog
  so names and scores agree. Listeners stop on navigation or
  unrecoverable errors; retry rechecks the server even when cached data is invalid.
  User-selected table sorting is preserved.
  Live listeners consume Firestore reads; local emulator timings do not establish
  production latency, capacity, or quota usage.

Validate this application and its updated rules together in staging before a
coordinated release. Older frontends that copy task names or award snapshots are
incompatible with the new write schema. Until the new rules are deployed, an
updated frontend cannot submit ID-only requests against the earlier rules.
If the workflow skips rule deployment because its credential is missing, deploy
the rules explicitly before uploading the frontend.
The local rules now close role self-creation/escalation, department-unscoped
writes, empty-role privileges, and self-review. Members can read approved
requests (the public rankings need them) and their own requests; pending,
rejected and cancelled requests are visible only to their owner and that
department's reviewers. No live scores have been rewritten, but displayed historical totals intentionally
change under this policy.
Backfilling task IDs or correcting repetitions requires a separately approved
migration with backups and a dry run.

## Inspection backlog

The scoring/validation and scoped department/history consolidation phases are
implemented above. These application and delivery issues remain:

- Approved requests, including their proof links, are readable by every member
  because the rankings are computed from them.
- Rankings still read all approved history and moderation reads every matching
  status record. Bound these reads without silently truncating rankings or search.
- Independent per-department rounds and historical-record repair are not
  implemented. The global IT-admin reset above preserves history and task prices.
- Legacy global styles still need further isolation outside the scoped components.
  Other screens have not received a complete accessibility audit.
- Initial JavaScript remains above Vite's 500 kB warning threshold after route
  splitting. Smaller entry bundles do not prove lower production Firebase latency.
- Existing source lint fails; full lint also includes generated Vite cache files.
  Deployment has no test/lint gate, uses an end-of-life Node version, and relies
  on separately managed Hostinger rewrite configuration.

Fix policy and workflow correctness before considering a backend migration.
Changing cloud vendors does not fix these application or authorization defects.

## AWS migration assessment (2026-10-26)

Moving to AWS is technically possible, but it is not a configuration-only change.
Google login would move to Cognito, Firestore queries and rules would become an
API plus authorization/validation code, and documents would move to DynamoDB
with keys/indexes designed for user history, moderation, and leaderboard access.
Existing React flows and direct Firebase calls would need to be rewired. Data
and user IDs must be mapped and verified; do not assume Firebase sessions transfer
to Cognito. Infrastructure can be versioned with AWS SAM, CDK, or Terraform.
Keep Hostinger initially to avoid combining frontend hosting and backend changes.

Current official no-cost allowances relevant to this application:

| Component | Relevant allowance | Important qualification |
| --- | --- | --- |
| [AWS account Free plan](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) | $100 initial credits; up to $100 more through eligible activities | Ends after six months or exhausted credits; the account closes unless upgraded. Not a permanent production plan. |
| [Cognito](https://aws.amazon.com/cognito/pricing/) | 10,000 monthly active users for direct/social login on Lite/Essentials | SAML/OIDC federation has only 50 free MAUs; Plus has no free MAU allowance. Check how Google login is configured. |
| [Lambda](https://aws.amazon.com/lambda/pricing/) | 1 million requests and 400,000 GB-seconds each month | Does not include API Gateway, all logs, or every optional feature. |
| [DynamoDB](https://aws.amazon.com/dynamodb/pricing/) | 25 GB Standard storage; 25 RCUs and 25 WCUs for provisioned capacity | On-demand reads/writes are billed; backups, excess capacity, and other features can add charges. |
| [API Gateway](https://aws.amazon.com/api-gateway/pricing/) | Listed trial: 1 million HTTP API calls per month for up to 12 months | Trial/credit eligibility depends on account plan and age; it is not an always-free API endpoint. |
| [Amplify Hosting](https://aws.amazon.com/amplify/pricing/) | Eligible for new-account credits | Hosting/build/bandwidth usage beyond applicable offers is paid; unnecessary if keeping Hostinger. |

For comparison, [Firestore's no-cost quota](https://firebase.google.com/docs/firestore/quotas)
includes 1 GiB storage, 50,000 document reads/day, 20,000 writes/day, 20,000
deletes/day, and 10 GiB outbound transfer/month for one free database per project.
These are document operations, not page views. Current client-side leaderboard
aggregation repeatedly reads approved history and can consume that quota.
TTL, backups, restore, and point-in-time recovery require billing.

Recommendation: correct authorization, stabilize scoring, and measure actual
usage before choosing a vendor. A small AWS deployment may fit several recurring
allowances, but "all free forever" is not established. A cost estimate needs the
AWS account's creation date/plan, target region, monthly active users, database
size, daily document reads/writes, peak traffic, and hosting requirements.
Do not use the temporary Free account plan as the long-term production strategy.
No AWS resources or live Firebase resources were changed as part of this assessment.
