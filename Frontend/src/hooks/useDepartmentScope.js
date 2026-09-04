import { useMemo } from 'react';
import { useApp } from './useApp';
import { activityQueue } from '../domain/requirements';

/**
 * Department-scoped selectors — a representative only ever sees their own
 * department's employees and the activities they are responsible for confirming.
 */
export function useDepartmentScope() {
  const app = useApp();
  const department = app.session?.department;

  return useMemo(() => {
    const employees = app.employees.filter((employee) => employee.department === department);
    return { department, employees, activities: activityQueue(employees) };
  }, [app.employees, department]);
}
