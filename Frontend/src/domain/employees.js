import { countRequirements } from './requirements';

/** An employee's overall requirement status, derived rather than stored. */
export function employeeStatus(employee) {
  const counts = countRequirements(employee);
  if (counts.completed === counts.total) return 'Completed';
  if (counts.completed === 0 && counts.progress === 0) return 'Pending';
  return 'In Progress';
}

/** Which milestone a department activity flips when it is confirmed. */
export const ACTIVITY_MILESTONE = {
  Orientation: 'orientation',
  'Department Training': 'training',
  'Team Introduction': 'intro'
};
