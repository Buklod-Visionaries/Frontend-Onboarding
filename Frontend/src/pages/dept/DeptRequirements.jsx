import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AutoGrid from '../../components/ui/AutoGrid';
import DividerList, { DividerRow } from '../../components/ui/DividerList';
import { EmptyState } from '../../components/ui/Notice';
import ConfirmActivityDialog from '../../components/feature/requirements/ConfirmActivityDialog';
import { useDepartmentScope } from '../../hooks/useDepartmentScope';
import { formatDate } from '../../domain/date';

const ACTIVITIES = ['Orientation', 'Department Training', 'Team Introduction'];

/** Confirming an activity updates the onboarding record and notifies HR. */
export default function DeptRequirements() {
  const scope = useDepartmentScope();
  const [confirm, setConfirm] = useState(null);

  return (
    <>
      <Card className="gap-4">
        <p className="m-0 text-cell text-ink/60">
          Orientation, training and team introduction for {scope.department}. Confirming an activity updates
          the employee&rsquo;s onboarding record and notifies HR.
        </p>

        <AutoGrid min={300} gap="gap-4">
          {ACTIVITIES.map((title) => {
            const rows = scope.activities.filter((row) => row.requirement.name === title);
            return (
              <Card key={title} padding="sm" className="gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-accent-700">Activity</div>
                  <div className="font-heading text-[21px]">{title}</div>
                </div>
                {rows.length ? (
                  <DividerList>
                    {rows.map((row) => {
                      const done = row.requirement.status === 'Completed';
                      return (
                        <DividerRow
                          key={row.requirement.id}
                          className="flex items-center gap-2.5 px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-field font-medium">{row.employee.name}</div>
                            <div className="text-[11px] text-ink/50">
                              {done
                                ? row.requirement.subLabel
                                : `Target ${formatDate(row.requirement.deadline)}`}
                            </div>
                          </div>
                          <Badge>{row.requirement.status}</Badge>
                          {!done && <Button onClick={() => setConfirm(row)}>Confirm</Button>}
                        </DividerRow>
                      );
                    })}
                  </DividerList>
                ) : (
                  <EmptyState>No employees for this activity.</EmptyState>
                )}
              </Card>
            );
          })}
        </AutoGrid>
      </Card>

      <ConfirmActivityDialog target={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
