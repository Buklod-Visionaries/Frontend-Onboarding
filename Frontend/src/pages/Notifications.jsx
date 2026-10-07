import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { EmptyState } from "../components/ui/Notice";
import NotificationList from "../components/feature/notifications/NotificationList";
import { useApp } from "../hooks/useApp";
//
import { useQueryClient } from "@tanstack/react-query";
import { useAllOwnNotif, useReadAllOwnNotif } from "../hooks/useNotifications";

/** One notifications screen, reused by all three roles — filtered by session role. */
export default function Notifications() {
  const app = useApp();
  const queryClient = useQueryClient();
  // const role = app.session.role;
  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useAllOwnNotif(app.session.accessToken);

  const readAllNotifMutation = useReadAllOwnNotif(app.session.accessToken);

  // const items = app.notifications.filter((notification) => notification.to === role);
  // const unread = items.filter((notification) => notification.unread).length;

  return (
    <Card className="gap-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <h4 className="text-[20px]">Notifications</h4>
        <span className="text-meta text-ink/55">
          {notifications.filter((notif) => !notif.isRead).length
            ? `${notifications.filter((notif) => !notif.isRead).length} unread`
            : "All caught up"}
        </span>
        {isLoading ? (
          ""
        ) : (
          <Button
            className="ml-auto"
            onClick={async () => {
              await readAllNotifMutation.mutateAsync(); //mark all as read by calling API
              queryClient.invalidateQueries({
                queryKey: ["notifications"], //reload notif state
              });
            }}
            disabled={isLoading}
          >
            Mark all as read
          </Button>
        )}
      </div>
      {notifications.length ? (
        <NotificationList items={notifications} />
      ) : (
        <EmptyState>No notifications yet.</EmptyState>
      )}
    </Card>
  );
}
