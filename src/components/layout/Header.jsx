import { useNavigate } from 'react-router-dom';
import { Segmented } from '../ui/Field';
import { useApp } from '../../hooks/useApp';

const ROLE_OPTIONS = [
  { value: 'HR', label: 'HR' },
  { value: 'Employee', label: 'Employee' },
  { value: 'Department', label: 'Dept' }
];

/** Page header: breadcrumb + title, demo role switcher. */
export default function Header({ crumb, title }) {
  const app = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b border-divider bg-bg px-7 py-4.5">
      <div className="mr-auto min-w-0">
        <div className="text-micro uppercase text-ink/50">{crumb}</div>
        <h3 className="mt-0.5 text-[25px]">{title}</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="hidden text-micro uppercase text-ink/50 sm:inline">Demo role</span>
        <Segmented
          value={app.session.role}
          onChange={(next) => navigate(app.login(next))}
          options={ROLE_OPTIONS}
        />
      </div>
    </header>
  );
}
