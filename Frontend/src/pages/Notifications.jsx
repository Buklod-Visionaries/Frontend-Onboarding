import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { EmptyState } from "../components/ui/Notice";
import { LoadingState, ErrorState } from "../components/ui/StatusMessage";
import NotificationList from "../components/feature/notifications/NotificationList";
import { useApp } from "../hooks/useApp";
//
import { useQueryClient } from "@tanstack/react-query";
import {
  useAllOwnNotif,
  useReadAllOwnNotif,
  useReadNotifById,
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
  const readNotifByIdMutation = useReadNotifById(app.session.accessToken);
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

        {/* Phones: the two actions share a full-width row. */}
        <div className="flex gap-2 max-sm:w-full max-sm:[&>*]:flex-1">
          <Button
            onClick={() => {
              // Mark all notifications as read immediately
              queryClient.setQueriesData(
                { queryKey: ["notifications"] },
                (oldData) => {
                  if (!Array.isArray(oldData)) return oldData;

                  return oldData.map((notif) => ({
                    ...notif,
                    isRead: true,
                  }));
                },
              );

              // Update the database
              readAllNotifMutation.mutate(undefined, {
                onError: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["notifications"],
                  });
                },
              });
            }}
            disabled={
              isLoading ||
              readAllNotifMutation.isPending ||
              notifications.filter((notif) => !notif.isRead).length === 0
            }
          >
            {readAllNotifMutation.isPending
              ? "Marking as read..."
              : "Mark all as read"}
          </Button>
          <Button
            onClick={async () => {
              await deleteAllNotifMutation.mutateAsync(); //delete all read by calling API
              queryClient.invalidateQueries({
                queryKey: ["notifications"], //reload notif state
              });
            }}
            disabled={
              isLoading ||
              deleteAllNotifMutation.isPending ||
              notifications.length === 0
            }
          >
            {deleteAllNotifMutation.isPending ? "Clearing..." : "Clear all"}
          </Button>
        </div>
      </div>
      {/* Loading and failure no longer read as "No notifications yet". */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState>Failed loading notifications.</ErrorState>
      ) : notifications.length ? (
        <NotificationList
          items={notifications}
          readNotifByIdMutation={readNotifByIdMutation}
        />
      ) : (
        <EmptyState>
          No notifications yet. New updates will appear here.
        </EmptyState>
      )}
    </Card>
  );
}
