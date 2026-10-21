import { CircleAlert, LoaderCircle } from "lucide-react";
import { cx } from "../../lib/cx";

/**
 * Loading and error placeholders for pages and panels, so "still loading" and
 * "failed to load" never look like an empty list (see EmptyState in Notice).
 */
export function LoadingState({ children = "Loading…", className }) {
  return (
    <div
      role="status"
      className={cx("flex items-center gap-2.5 py-6 text-field text-ink/60", className)}
    >
      <LoaderCircle
        size={18}
        strokeWidth={1.75}
        aria-hidden="true"
        className="shrink-0 animate-spin text-accent motion-reduce:animate-none"
      />
      {children}
    </div>
  );
}

export function ErrorState({ children, className }) {
  return (
    <div
      role="alert"
      className={cx(
        "flex items-start gap-2.5 border border-red-200 bg-red-50 px-4 py-3.5 text-field text-red-900",
        className,
      )}
    >
      <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
      <div>
        {children}
        <div className="text-cell text-red-900/75">
          Refresh the page to try again.
        </div>
      </div>
    </div>
  );
}
