import DividerList, { DividerRow } from "../../ui/DividerList";
import { cx } from "../../../lib/cx";
import { formatRelativeDate } from "../../../domain/date";

/** Notification rows, shared by all three roles. */
export default function NotificationList({ items }) {
  return (
    <DividerList>
      {items.map((notification) => (
        <DividerRow
          key={notification._id}
          as="article"
          className={cx(
            "flex items-start gap-3 px-4 py-3.5",
            notification.isRead && "opacity-70",
          )}
        >
          <span
            className={cx(
              "mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full",
              !notification.isRead ? "bg-accent" : "bg-neutral-400",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="text-field font-medium">{notification.title}</div>
            <div className="text-cell text-ink/60">{notification.message}</div>
          </div>
          <div className="whitespace-nowrap text-[11px] text-ink/45">
            {formatRelativeDate(notification.createdAt)}
          </div>
        </DividerRow>
      ))}
    </DividerList>
  );
}
