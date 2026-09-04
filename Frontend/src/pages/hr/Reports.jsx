import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { StatStrip } from '../../components/ui/StatCard';
import { Field, Select } from '../../components/ui/Field';
import { TCell, THead, TRow, Table } from '../../components/ui/Table';
import { useApp } from '../../hooks/useApp';
import { countRequirements } from '../../domain/requirements';
import { employeeStatus } from '../../domain/employees';
import { DEPARTMENTS } from '../../domain/constants';

const TYPES = [
  'Employee onboarding status',
  'Completed requirements',
  'Pending requirements',
  'Overdue requirements',
  'In-progress requirements'
];

const GENERATED_AT = 'Aug 16, 2026, 10:24 AM';

export default function Reports() {
  const app = useApp();
  const [type, setType] = useState(TYPES[0]);
  const [department, setDepartment] = useState('All');
  const [stamp, setStamp] = useState('');

  const rows = app.employees.filter(
    (employee) => department === 'All' || employee.department === department
  );

  const totals = { completed: 0, progress: 0, pending: 0, overdue: 0 };
  for (const employee of rows) {
    const counts = countRequirements(employee);
    totals.completed += counts.completed;
    totals.progress += counts.progress;
    totals.pending += counts.pending;
    totals.overdue += counts.overdue;
  }

  return (
    <Card className="gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Report type" className="min-w-[200px]">
          <Select
            value={type}
            options={TYPES}
            onChange={(e) => {
              setType(e.target.value);
              setStamp('');
            }}
          />
        </Field>
        <Field label="Department" className="min-w-[180px]">
          <Select
            value={department}
            options={[{ value: 'All', label: 'All departments' }, ...DEPARTMENTS]}
            onChange={(e) => {
              setDepartment(e.target.value);
              setStamp('');
            }}
          />
        </Field>
        <Button variant="primary" onClick={() => setStamp(GENERATED_AT)}>
          Generate report
        </Button>
      </div>

      {stamp && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-2.5 border-t border-divider pt-4">
            <h4 className="text-[20px]">
              {type} &mdash; {department === 'All' ? 'all departments' : department}
            </h4>
            <span className="text-[11px] text-ink/50">Generated {stamp}</span>
          </div>

          <StatStrip
            items={[
              { label: 'Employees', value: rows.length },
              { label: 'Completed requirements', value: totals.completed },
              { label: 'In progress', value: totals.progress },
              { label: 'Pending', value: totals.pending },
              { label: 'Overdue', value: totals.overdue }
            ]}
          />

          <Table>
            <THead
              columns={[
                'Employee',
                'Position',
                'Department',
                'Completed',
                'In progress',
                'Pending',
                'Overdue',
                'Status'
              ]}
            />
            <tbody>
              {rows.map((employee) => {
                const counts = countRequirements(employee);
                return (
                  <TRow key={employee.id}>
                    <TCell strong>{employee.name}</TCell>
                    <TCell>{employee.position}</TCell>
                    <TCell>{employee.department}</TCell>
                    <TCell>{counts.completed}</TCell>
                    <TCell>{counts.progress}</TCell>
                    <TCell>{counts.pending}</TCell>
                    <TCell>{counts.overdue}</TCell>
                    <TCell>
                      <Badge>{employeeStatus(employee)}</Badge>
                    </TCell>
                  </TRow>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </Card>
  );
}
