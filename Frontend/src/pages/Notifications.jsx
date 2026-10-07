import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { EmptyState } from "../components/ui/Notice";
import NotificationList from "../components/feature/notifications/NotificationList";
import { useApp } from "../hooks/useApp";
//
import { useQueryClient } from "@tanstack/react-query";
import {
  useAllOwnNotif,
  useReadAllOwnNotif,
  useDeleteAllOwnNotif,
} from "../hooks/useNotifications";

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
  const deleteAllNotifMutation = useDeleteAllOwnNotif(app.session.accessToken);

  // const items = app.notifications.filter((notification) => notification.to === role);
  // const unread = items.filter((notification) => notification.unread).length;

  return (
    <Card className="gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3 ">
        <h4 className="text-[20px]">
          Notifications{" "}
          <span className="ml-2 text-meta text-ink/55">
            {notifications.filter((notif) => !notif.isRead).length
              ? `${notifications.filter((notif) => !notif.isRead).length} unread`
              : " All caught up"}
          </span>
        </h4>

        <div className="flex">
          <Button
            className="mx-2"
            onClick={async () => {
              await readAllNotifMutation.mutateAsync(); //mark all as read by calling API
              queryClient.invalidateQueries({
                queryKey: ["notifications"], //reload notif state
              });
            }}
            disabled={
              isLoading ||
              notifications.filter((notif) => !notif.isRead).length === 0 //disabled when no notifs are unread
            }
          >
            Mark all as read
          </Button>
          <Button
            className="mx-2"
            onClick={async () => {
              await deleteAllNotifMutation.mutateAsync(); //delete all read by calling API
              queryClient.invalidateQueries({
                queryKey: ["notifications"], //reload notif state
              });
            }}
            disabled={isLoading || notifications.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>
      {notifications.length ? (
        <NotificationList items={notifications} />
      ) : (
        <EmptyState>No notifications yet.</EmptyState>
      )}
    </Card>
  );
}
