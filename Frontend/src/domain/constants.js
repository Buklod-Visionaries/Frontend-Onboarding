export const DEPARTMENTS = ['Laboratory', 'Imaging', 'Cardiovascular', 'Administration'];

export const ROLES = ['HR Staff', 'Department Representative', 'Employee'];

/**
 * Requirements only ever hold these three statuses. "Awaiting HR verification",
 * "Resubmission requested", "Verified by HR" and "Confirmed by department" are
 * sub-labels on top of a status, never statuses of their own.
 */
export const STATUSES = ['Pending', 'In Progress', 'Completed'];

export const ACCOUNT_STATUSES = ['Active', 'Pending first login', 'Deactivated'];

export const SUB_LABELS = {
  notSubmitted: 'Not yet submitted',
  awaitingHr: 'Awaiting HR verification',
  resubmission: 'Resubmission requested',
  verified: 'Verified by HR',
  confirmed: 'Confirmed by department'
};

export const TEMP_PASSWORD = 'PMCL-Temp-4471';

export const EM_DASH = '—';
