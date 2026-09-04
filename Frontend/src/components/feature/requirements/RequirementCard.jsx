import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge, { OverdueBadge } from '../../ui/Badge';
import { formatDate } from '../../../domain/date';
import { isOverdue } from '../../../domain/requirements';
import { SUB_LABELS } from '../../../domain/constants';

/** Employee-facing requirement card. */
export default function RequirementCard({ requirement, onOpen }) {
  const ownedByEmployee = requirement.owner === 'Employee';

  const cta =
    requirement.status === 'Completed'
      ? 'View details'
      : ownedByEmployee
        ? requirement.status === 'Pending'
          ? 'Upload document'
          : 'View / resubmit'
        : 'View details';

  const sub = ownedByEmployee
    ? requirement.subLabel
    : requirement.subLabel === SUB_LABELS.notSubmitted
      ? 'Confirmed by your department representative'
      : requirement.subLabel;

  return (
    <Card padding="sm" className="gap-2.5">
      <div className="flex items-start gap-2.5">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.12em] text-ink/45">{requirement.type}</div>
          <div className="mt-0.5 font-heading text-[19px] leading-tight">{requirement.name}</div>
        </div>
        <Badge>{requirement.status}</Badge>
      </div>
      <div className="text-cell text-ink/60">{sub}</div>
      <div className="flex items-center gap-2 text-meta text-ink/50">
        <span>Due {formatDate(requirement.deadline)}</span>
        <OverdueBadge when={isOverdue(requirement)} />
      </div>
      <Button className="self-start" onClick={onOpen}>
        {cta}
      </Button>
    </Card>
  );
}
