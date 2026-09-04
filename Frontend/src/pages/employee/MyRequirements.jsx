import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import AutoGrid from '../../components/ui/AutoGrid';
import { Segmented } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/Notice';
import RequirementCard from '../../components/feature/requirements/RequirementCard';
import { useCurrentEmployee } from '../../hooks/useCurrentEmployee';
import { STATUSES } from '../../domain/constants';

const FILTERS = ['All', ...STATUSES];

export default function MyRequirements() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const me = useCurrentEmployee();

  const rows = me.requirements.filter(
    (requirement) => filter === 'All' || requirement.status === filter
  );

  return (
    <Card className="gap-4">
      <Segmented value={filter} onChange={setFilter} options={FILTERS} />
      {rows.length ? (
        <AutoGrid min={280} gap="gap-4">
          {rows.map((requirement) => (
            <RequirementCard
              key={requirement.id}
              requirement={requirement}
              onOpen={() => navigate(`/employee/requirements/${requirement.id}`)}
            />
          ))}
        </AutoGrid>
      ) : (
        <EmptyState>No requirements with this status.</EmptyState>
      )}
    </Card>
  );
}
