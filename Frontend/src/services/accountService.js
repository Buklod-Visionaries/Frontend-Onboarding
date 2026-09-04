import { ACTIVITY_LOG, EMPLOYEE_ACCOUNT_STATUS, STAFF_USERS } from '../data/accounts';

/**
 * The swap point for account and activity data. Returns static fixtures today;
 * becomes API calls later.
 */
export function loadStaffUsers() {
  return [...STAFF_USERS];
}

export function loadEmployeeAccountStatus() {
  return { ...EMPLOYEE_ACCOUNT_STATUS };
}

export function loadActivityLog() {
  return [...ACTIVITY_LOG];
}
