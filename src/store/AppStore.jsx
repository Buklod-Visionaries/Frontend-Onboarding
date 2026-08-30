import { useCallback, useMemo, useRef, useState } from 'react';
import { AppContext } from './AppContext';
import { SESSION_PROFILES } from '../data/accounts';

/**
 * In-memory store for the prototype.
 *
 * Step 4 scope: session and toast only — enough for routing, the role guard and
 * the layout shell. Step 3 adds employees, staff users, notifications, activity
 * and the mutators, calling `services/` rather than fixtures directly.
 *
 * `employees` and `notifications` are already exposed as empty arrays so the
 * layout can derive its badge counts today and keep working unchanged once the
 * real data lands.
 */
export default function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(0);

  const showToast = useCallback((text) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3200);
  }, []);

  /** Returns the role's home path so callers can navigate straight there. */
  const login = useCallback((role) => {
    const profile = SESSION_PROFILES[role];
    setSession({ role, ...profile });
    return profile.home;
  }, []);

  const logout = useCallback(() => setSession(null), []);

  const value = useMemo(
    () => ({
      session,
      login,
      logout,
      toast,
      showToast,
      // Populated in Step 3.
      employees: [],
      notifications: []
    }),
    [session, login, logout, toast, showToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
