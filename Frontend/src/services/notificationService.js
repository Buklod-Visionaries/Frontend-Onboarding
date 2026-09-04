import { NOTIFICATIONS } from '../data/accounts';

/**
 * The swap point for notifications. Static fixtures today; an API call later.
 * Notifications are in-app only — there is no email or SMS in scope.
 */
export function loadNotifications() {
  return [...NOTIFICATIONS];
}
