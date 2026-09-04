import { seedEmployees } from '../data/employees';

/**
 * The swap point for employee data.
 *
 * Right now this just hands back the static fixtures from `data/employees.js` —
 * it runs entirely in the browser and makes no network call. When a real API
 * exists, this is the only file that changes: `loadEmployees` becomes a fetch,
 * and no component or page needs touching, because nothing outside the store
 * imports the fixtures.
 */
export function loadEmployees() {
  return seedEmployees();
}
