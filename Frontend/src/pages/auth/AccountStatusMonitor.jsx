import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/hooks/useApp";
import api from "@/lib/axios";

export default function AccountStatusMonitor() {
  const app = useApp();
  const accessToken = app.session?.accessToken;
  const logout = app.logout;

  const navigate = useNavigate();
  const isLoggingOut = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      isLoggingOut.current = false;
      return;
    }

    let stopped = false;

    const checkStatus = async () => {
      if (stopped || isLoggingOut.current) return;

      try {
        await api.get("/auth/status", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        const isDeactivated =
          error.response?.status === 403 &&
          error.response?.data?.code === "ACCOUNT_DEACTIVATED";

        const accountMissing =
          error.response?.status === 401 &&
          error.response?.data?.code === "ACCOUNT_NOT_FOUND";

        if ((isDeactivated || accountMissing) && !stopped) {
          isLoggingOut.current = true;

          try {
            await logout();
          } finally {
            navigate("/login", {
              replace: true,
              state: {
                message: isDeactivated
                  ? "Your account has been deactivated. Please contact HR."
                  : "Your account is no longer available. Please contact HR.",
              },
            });
          }
        }
      }
    };

    checkStatus();

    const intervalId = window.setInterval(checkStatus, 30_000);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, [accessToken, logout, navigate]);

  return null;
}
