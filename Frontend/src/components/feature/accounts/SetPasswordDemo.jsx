// DEMO ONLY — remove this file (and its one line in AppShell) when the real
// first-login check and password API are wired in.
import { useState } from "react";
import { useLocation } from "react-router-dom";
import SetPasswordDialog from "./SetPasswordDialog";

// const SEEN_KEY = "pmcl-set-password-preview-seen";

// function seenThisSession() {
//   try {
//     return sessionStorage.getItem(SEEN_KEY) === "1";
//   } catch {
//     return false;
//   }
// }

/**
 * Opens the Set a New Password dialog over any dashboard, once per browser
 * session (or every time with ?preview=set-password), for design review.
 * Submitting only waits briefly — no API call, nothing is saved.
 */
export default function SetPasswordDemo({ currentUser }) {
  const { pathname, search } = useLocation();
  const forced = new URLSearchParams(search).get("preview") === "set-password";
  const onDashboard = pathname.endsWith("/dashboard");
  const [dismissed, setDismissed] = useState(false);

  // const open = onDashboard && !dismissed && (forced || !seenThisSession());
  const open =
    (currentUser.isFirstLogin || currentUser.passwordResetRequested) &&
    !dismissed;

  return (
    <SetPasswordDialog
      open={open}
      preview
      currentUser={currentUser}
      // onSubmit={() => new Promise((resolve) => setTimeout(resolve, 1200))}
      onDone={() => setDismissed(true)}
    />
  );
}
