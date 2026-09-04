import { useMemo } from 'react';
import { useApp } from './useApp';
import { verificationQueue } from '../domain/requirements';

/** Every submission awaiting HR review, as `{ employee, requirement }` rows. */
export function useVerificationQueue() {
  const app = useApp();
  return useMemo(() => verificationQueue(app.employees), [app.employees]);
}
