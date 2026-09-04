import {
  ACTIVITY_REQUIREMENTS,
  BASE_REQUIREMENTS,
  EXTRA_REQUIREMENT_OFFSET,
  POSITIONS
} from '../data/positions';
import { SUB_LABELS } from './constants';
import { TODAY, addDays } from './date';

/** Stable, readable ids: 'e1-transcript-of-records'. */
function requirementId(prefix, name) {
  return `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

/**
 * Automatic requirement assignment: position + department decide the list.
 *
 * `idPrefix` scopes the generated ids to one employee. The Add Employee screen
 * calls this with a throwaway prefix to preview the list before the record
 * exists, so ids must not depend on any shared counter.
 */
export function buildRequirements(position, startDate, idPrefix = 'preview') {
  const config = POSITIONS[position] ?? { extra: [] };
  const extras = config.extra.map((name) => ({
    name,
    type: 'Document',
    offset: EXTRA_REQUIREMENT_OFFSET
  }));

  return [...BASE_REQUIREMENTS, ...extras, ...ACTIVITY_REQUIREMENTS].map((row) => ({
    id: requirementId(idPrefix, row.name),
    name: row.name,
    type: row.type,
    owner: row.type === 'Activity' ? 'Department' : 'Employee',
    deadline: addDays(startDate, row.offset),
    status: 'Pending',
    subLabel: SUB_LABELS.notSubmitted,
    file: '',
    submitted: '',
    note: '',
    history: []
  }));
}

export function isOverdue(requirement) {
  return requirement.status !== 'Completed' && requirement.deadline < TODAY;
}

/** Totals for one employee, plus the completion percentage. */
export function countRequirements(employee) {
  const counts = { total: employee.requirements.length, completed: 0, progress: 0, pending: 0, overdue: 0 };

  for (const requirement of employee.requirements) {
    if (requirement.status === 'Completed') counts.completed += 1;
    else if (requirement.status === 'In Progress') counts.progress += 1;
    else counts.pending += 1;
    if (isOverdue(requirement)) counts.overdue += 1;
  }

  counts.pct = counts.total ? Math.round((counts.completed / counts.total) * 100) : 0;
  return counts;
}

export function isAwaitingVerification(requirement) {
  return requirement.status === 'In Progress' && requirement.subLabel === SUB_LABELS.awaitingHr;
}

/** Every submission waiting on HR, flattened to `{ employee, requirement }` rows. */
export function verificationQueue(employees) {
  const rows = [];
  for (const employee of employees) {
    for (const requirement of employee.requirements) {
      if (isAwaitingVerification(requirement)) rows.push({ employee, requirement });
    }
  }
  return rows;
}

/** Department-owned activities across a set of employees. */
export function activityQueue(employees) {
  const rows = [];
  for (const employee of employees) {
    for (const requirement of employee.requirements) {
      if (requirement.type === 'Activity') rows.push({ employee, requirement });
    }
  }
  return rows;
}
