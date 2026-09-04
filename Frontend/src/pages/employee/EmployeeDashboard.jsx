import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import AutoGrid from '../../components/ui/AutoGrid';
import DividerList, { DividerRow } from '../../components/ui/DividerList';
import { StatStrip } from '../../components/ui/StatCard';
import { EmptyState } from '../../components/ui/Notice';
import { cx } from '../../lib/cx';
import { useApp } from '../../hooks/useApp';
import { useCurrentEmployee } from '../../hooks/useCurrentEmployee';
import { countRequirements } from '../../domain/requirements';
import { formatDate } from '../../domain/date';

export default function EmployeeDashboard() {
  const app = useApp();
  const navigate = useNavigate();
  const me = useCurrentEmployee();
  const counts = countRequirements(me);

  const actionable = me.requirements
    .filter((requirement) => requirement.status !== 'Completed' && requirement.owner === 'Employee')
    .slice(0, 5);

  const notifications = app.notifications
    .filter((notification) => notification.to === 'Employee')
    .slice(0, 3);

  return (
    <>
      <Card padding="lg" className="gap-4">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-micro uppercase text-accent-700">Overall onboarding progress</div>
            <h2 className="mt-1.5 text-[34px]">{me.name}</h2>
            <div className="text-cell text-ink/55">
              {me.position} &middot; {me.department} &middot; Started {formatDate(me.start)}
            </div>
          </div>
          <div className="font-heading text-[56px] leading-none">{counts.pct}%</div>
        </div>
        <ProgressBar value={counts.pct} height="lg" />
        <StatStrip
          min={140}
          items={[
            { label: 'Completed', value: counts.completed },
            { label: 'In progress', value: counts.progress },
            { label: 'Pending', value: counts.pending },
            { label: 'Overdue', value: counts.overdue }
          ]}
        />
      </Card>

      <AutoGrid min={320}>
        <Card className="gap-3">
          <div className="flex items-baseline">
            <h4 className="text-[20px]">Needs your action</h4>
            <Button
              variant="ghost"
              className="ml-auto"
              onClick={() => navigate('/employee/requirements')}
            >
              All requirements
            </Button>
          </div>
          {actionable.length ? (
            <DividerList>
              {actionable.map((requirement) => (
                <DividerRow
                  key={requirement.id}
                  as="button"
                  type="button"
                  onClick={() => navigate(`/employee/requirements/${requirement.id}`)}
                  className="flex items-center gap-3 px-3.5 py-3 text-left hover:bg-accent-100"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-field font-medium">{requirement.name}</span>
                    <span className="block text-meta text-ink/55">
                      {requirement.subLabel} &middot; due {formatDate(requirement.deadline)}
                    </span>
                  </span>
                  <Badge>{requirement.status}</Badge>
                </DividerRow>
              ))}
            </DividerList>
          ) : (
            <EmptyState>Nothing needs your action right now.</EmptyState>
          )}
        </Card>

        <Card className="gap-3">
          <div className="flex items-baseline">
            <h4 className="text-[20px]">Recent notifications</h4>
            <Button
              variant="ghost"
              className="ml-auto"
              onClick={() => navigate('/employee/notifications')}
            >
              View all
            </Button>
          </div>
          {notifications.length ? (
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {notifications.map((notification) => (
                <li key={notification.id} className="grid gap-3" style={{ gridTemplateColumns: '8px 1fr' }}>
                  <span
                    className={cx(
                      'mt-1.5 h-[7px] w-[7px] rounded-full',
                      notification.unread ? 'bg-accent' : 'bg-neutral-400'
                    )}
                  />
                  <div>
                    <div className="text-field font-medium">{notification.title}</div>
                    <div className="text-cell text-ink/60">{notification.body}</div>
                    <div className="mt-0.5 text-[11px] text-ink/45">{notification.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No notifications yet.</EmptyState>
          )}
        </Card>
      </AutoGrid>
    </>
  );
}
