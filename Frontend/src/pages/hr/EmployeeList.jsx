import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import { Input, Segmented } from '../../components/ui/Field';
import { TCell, THead, TRow, Table } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/Notice';
import { useApp } from '../../hooks/useApp';
import { countRequirements } from '../../domain/requirements';
import { employeeStatus } from '../../domain/employees';
import { formatDate } from '../../domain/date';
import { DEPARTMENTS } from '../../domain/constants';

export default function EmployeeList() {
  const app = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  const query = search.trim().toLowerCase();
  const rows = app.employees.filter((employee) => {
    const byDepartment = department === 'All' || employee.department === department;
    const byQuery =
      !query ||
      employee.name.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query);
    return byDepartment && byQuery;
  });

  return (
    <Card className="gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-[280px]"
          placeholder="Search employee or position"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Segmented
          value={department}
          onChange={setDepartment}
          options={['All', ...DEPARTMENTS]}
        />
        <Button variant="primary" className="ml-auto" onClick={() => navigate('/hr/employees/new')}>
          Add employee
        </Button>
      </div>

      {rows.length ? (
        <Table>
          <THead
            columns={[
              'Employee',
              'Position',
              'Department',
              'Start date',
              'Progress',
              'Status',
              { label: '', align: 'right' }
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
                  <TCell>{formatDate(employee.start)}</TCell>
                  <TCell className="min-w-[160px]">
                    <div className="flex items-center gap-2.5">
                      <ProgressBar height="sm" value={counts.pct} className="min-w-[80px] flex-1" />
                      <span className="text-meta tabular-nums text-ink/60">
                        {counts.completed}/{counts.total}
                      </span>
                    </div>
                  </TCell>
                  <TCell>
                    <Badge>{employeeStatus(employee)}</Badge>
                  </TCell>
                  <TCell align="right">
                    <Button onClick={() => navigate(`/hr/employees/${employee.id}`)}>Open</Button>
                  </TCell>
                </TRow>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <EmptyState>No employees match this search.</EmptyState>
      )}

      <span className="text-meta text-ink/50">
        Showing {rows.length} of {app.employees.length} employee records
      </span>
    </Card>
  );
}
