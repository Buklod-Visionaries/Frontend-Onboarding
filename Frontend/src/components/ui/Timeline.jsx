import { formatDate, formatRelativeDate } from "../../domain/date";
import { cx } from "../../lib/cx";

/** Dotted activity / history feed. `round` switches square marks to dots. */
export function EventList({ items, round, history, notifications }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
      {items.map((event, i) => (
        <li
          key={i}
          className="grid gap-3"
          style={{ gridTemplateColumns: "8px 1fr" }}
        >
          <span
            className={cx(
              "mt-1.5 h-[7px] w-[7px]",
              round && "rounded-full",
              notifications
                ? !event.isRead
                  ? "bg-accent"
                  : "bg-neutral-400"
                : "bg-accent",
            )}
          />
          <div>
            <div className="text-field">
              {notifications ? event.title : history && event.note}{" "}
              {/* change content dynamically based on type*/}
            </div>
            <div className="text-[11px] text-ink/45">
              {formatRelativeDate(event.createdAt)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
