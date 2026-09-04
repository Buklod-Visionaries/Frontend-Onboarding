import { useApp } from './useApp';

/** The employee record behind the signed-in Employee session. */
export function useCurrentEmployee() {
  const app = useApp();
  return app.getEmployee(app.session?.employeeId);
}
