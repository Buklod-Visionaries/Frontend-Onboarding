import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/Notice';
import NotificationList from '../components/feature/notifications/NotificationList';
import { useApp } from '../hooks/useApp';

/** One notifications screen, reused by all three roles — filtered by session role. */
export default function Notifications() {
  const app = useApp();
  const role = app.session.role;
  const items = app.notifications.filter((notification) => notification.to === role);
  const unread = items.filter((notification) => notification.unread).length;

  return (
    <Card className="gap-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <h4 className="text-[20px]">Notifications</h4>
        <span className="text-meta text-ink/55">{unread ? `${unread} unread` : 'All caught up'}</span>
        <Button className="ml-auto" onClick={() => app.markAllRead(role)}>
          Mark all as read
        </Button>
      </div>
      {items.length ? <NotificationList items={items} /> : <EmptyState>No notifications yet.</EmptyState>}
    </Card>
  );
}
