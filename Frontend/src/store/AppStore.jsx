import { useCallback, useMemo, useRef, useState } from 'react';
import { AppContext } from './AppContext';
import { SESSION_PROFILES } from '../data/accounts';


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
