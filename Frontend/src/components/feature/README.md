# `components/feature/` — onboarding-aware components


## `requirements/`

| File | Purpose |
| --- | --- |
| `ReviewDialog.jsx` | HR's document review. Shows a document preview panel and submission metadata, then offers Approve or a **two-step** resubmission: the first click swaps the footer and reveals a reason textarea, the second sends it. Refuses to send an empty reason. Opened from the HR dashboard, the verification queue and the employee profile. |
| `ConfirmActivityDialog.jsx` | The department representative confirming orientation, training or team introduction, with an optional note. |
| `RequirementCard.jsx` | The employee-facing requirement tile. Its call to action adapts to state — *Upload document* when pending, *View / resubmit* when in progress, *View details* when completed or department-owned. |

## `accounts/`

| File | Purpose |
| --- | --- |
| `CreateUserDialog.jsx` | Role-first account creation. HR Staff and Department Representative are created here; choosing Employee replaces the form with an explanation and routes to Add Employee instead, because an employee account and its requirements are created together. The department select appears only for representatives. |
| `ManageAccessDialog.jsx` | Account status and, for representatives, assigned department. Also offers a reset to a temporary password. |
| `AccountCreatedDialog.jsx` | The credential receipt shown after either kind of account is created. The "requirements assigned" notice appears only when the count is non-zero, so staff accounts omit it. |
| `SignOutDialog.jsx` | Sign-out confirmation, shown at every screen size. |

## `notifications/`

| File | Purpose |
| --- | --- |
| `NotificationList.jsx` | The notification rows, shared by all three roles. Unread rows carry an accent dot and full opacity; read rows dim. Built on `ui/DividerList`. |

