import { useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import { EmptyState } from '../components/ui/Notice';

/**
 * TEMPORARY. Stands in for a page that has not been built yet, so the shell,
 * navigation and role guard can be exercised end to end. Each placeholder is
 * replaced by its real page in Steps 5, 7 and 8.
 */
export default function PagePlaceholder({ name, step }) {
  const location = useLocation();
  return (
    <Card className="gap-3.5">
      <div className="flex flex-wrap items-baseline gap-2.5">
        <h4 className="text-[20px]">{name}</h4>
        <span className="text-meta text-ink/55">{location.pathname}</span>
      </div>
      <EmptyState>This screen is built in Step {step}.</EmptyState>
    </Card>
  );
}
