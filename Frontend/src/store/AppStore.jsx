import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import { loadEmployees } from "../services/employeeService";
import {
  loadActivityLog,
  loadEmployeeAccountStatus,
  loadStaffUsers,
} from "../services/accountService";
import { loadNotifications } from "../services/notificationService";
import { SESSION_PROFILES } from "../data/accounts";
import { POSITIONS } from "../data/positions";
import { buildRequirements } from "../domain/requirements";
import { TEMP_PASSWORD } from "../domain/constants";
import api from "../lib/axios";

function workEmailFor(name, email) {
  return email.trim() || `${name.toLowerCase().split(" ").join(".")}@pmcl.ph`;
}

export default function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  //
  const [sessionLoading, setSessionLoading] = useState(true);
  const [employees] = useState(loadEmployees);
  const [staffUsers, setStaffUsers] = useState(loadStaffUsers);
  const [employeeAccounts, setEmployeeAccounts] = useState(
    loadEmployeeAccountStatus,
  );
  const [notifications, setNotifications] = useState(loadNotifications);
  const [activity] = useState(loadActivityLog);
  const [settings, setSettings] = useState({ deadline: "7", reminder: "3" });
  const [toast, setToast] = useState("");
  const toastTimer = useRef(0);

  const showToast = useCallback((text) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3200);
  }, []);

  const notify = useCallback((to, title, body) => {
    setNotifications((list) => [
      {
        id: `n${Date.now()}${Math.random()}`,
        to,
        title,
        body,
        time: "Just now",
        unread: true,
      },
      ...list,
    ]);
  }, []);

  /** Returns the role's home path so callers can navigate straight there. */
  // const login = useCallback((role) => {
  //   const profile = SESSION_PROFILES[role];
  //   setSession({ role, ...profile });
  //   return profile.home;
  // }, []);

  const login = useCallback(async (email, password) => {
    //calls the login api
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    //destructure data
    const { accessToken, user } = res.data;

    //store data in variable
    const newSession = {
      accessToken,
      ...user,
    };

    //set new session
    setSession(newSession);
    console.log("login:", newSession);

    return newSession;
  }, []);

  const firstLogin = useCallback(async (email, tempPass, newPass) => {
    //calls the first login api
    const res = await api.post("/auth/first-login", {
      email,
      tempPass,
      newPass,
    });
    //destructure accessToken and user
    const { accessToken, user } = res.data;

    //store accessToken and user values in a variable
    const newSession = {
      accessToken,
      ...user,
    };

    //set new session
    setSession(newSession);
    console.log("login:", newSession);

    return newSession;
  }, []);

  // const logout = useCallback(() => setSession(null), []);
  const logout = useCallback(async () => {
    try {
      //call logout api
      await api.post("/auth/logout");
    } finally {
      //set session to empty
      setSession(null);
    }
  }, []);

  // --- Onboarding actions: UI feedback only, no records changed --------------

  //working document upload
  const submitDocument = useCallback(
    async (pendingFile, id) => {
      //create a structure to upload file
      const formData = new FormData();
      //set the target requirements id for file upload
      formData.append("employeeRequirementId", id);
      //set the actual file
      formData.append("file", pendingFile);

      //upload the file and link it to the requirements to the DB
      const res = await api.post("/documents", formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      console.log(res.data);
      showToast(`${pendingFile.name} submitted - awaiting HR Verification`);
    },
    // (requirement) =>
    //   showToast(`${requirement.name} submitted — awaiting HR verification`),
    // [showToast],
  );

  const approveRequirement = useCallback(
    (requirement) => showToast(`${requirement.name} marked completed`),
    [showToast],
  );

  const requestResubmission = useCallback(
    (employee) => showToast(`Resubmission requested from ${employee.name}`),
    [showToast],
  );

  //specific for department reps
  const confirmActivity = useCallback(
    //
    async (empReq, setDepRequirements, setConfirmLoading) => {
      try {
        setConfirmLoading(true);
        //call the edit employee requirement api
        const res = await api.put(
          `/employee-requirements/${empReq._id}`,
          { status: "completed" }, //they can only mark complete
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`, //set token for authorization
            },
          },
        );
        //only update the changed req
        setDepRequirements((prevDepReq) =>
          prevDepReq.map((req) =>
            req._id === empReq._id ? { ...req, status: res.data.status } : req,
          ),
        );
        showToast(
          `${empReq.requirement.name} confirmed for ${empReq.employee.user.username}`,
        );
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    },
    // (employee, requirement) =>
    //   showToast(`${requirement.name} confirmed for ${employee.name}`),
    // [showToast],
  );

  const sendReminder = useCallback(
    (employee) => showToast(`Reminder sent to ${employee.name}`),
    [showToast],
  );

  /**
   * Add Employee. Returns the receipt the confirmation dialog renders — the
   * department and requirement count are derived from the position, so the
   * dialog shows what a real create would have produced.
   */
  const createEmployee = useCallback(
    (form) => {
      const config = POSITIONS[form.position];
      const requirementCount = buildRequirements(
        form.position,
        form.start,
        "preview",
      ).length;
      showToast(`${requirementCount} requirements assigned to ${form.name}`);
      return {
        name: form.name,
        role: "Employee",
        department: config.department,
        email: workEmailFor(form.name, form.email),
        temp: TEMP_PASSWORD,
        requirementCount,
      };
    },
    [showToast],
  );

  /** Create User. Returns the receipt for the confirmation dialog. */
  const createStaffUser = useCallback(
    (draft) => {
      const department =
        draft.role === "HR Staff" ? "HR Department" : draft.department;
      showToast(`${draft.role} account created for ${draft.name}`);
      return {
        name: draft.name,
        role: draft.role,
        department,
        email: workEmailFor(draft.name, draft.email),
        temp: TEMP_PASSWORD,
        requirementCount: 0,
      };
    },
    [showToast],
  );

  const updateAccount = useCallback((target, patch) => {
    if (target.kind === "staff") {
      setStaffUsers((list) =>
        list.map((u) => (u.id === target.id ? { ...u, ...patch } : u)),
      );
    } else {
      setEmployeeAccounts((map) => ({ ...map, [target.id]: patch.status }));
    }
  }, []);

  const markAllRead = useCallback((role) => {
    setNotifications((list) =>
      list.map((n) => (n.to === role ? { ...n, unread: false } : n)),
    );
  }, []);

  const getEmployee = useCallback(
    (id) => employees.find((employee) => employee.id === id),
    [employees],
  );

  const value = useMemo(
    () => ({
      session,
      sessionLoading,
      login,
      firstLogin,
      logout,
      employees,
      staffUsers,
      employeeAccounts,
      notifications,
      activity,
      settings,
      setSettings,
      toast,
      showToast,
      notify,
      submitDocument,
      approveRequirement,
      requestResubmission,
      confirmActivity,
      createEmployee,
      createStaffUser,
      updateAccount,
      markAllRead,
      sendReminder,
      getEmployee,
    }),
    [
      session,
      sessionLoading,
      login,
      firstLogin,
      logout,
      employees,
      staffUsers,
      employeeAccounts,
      notifications,
      activity,
      settings,
      toast,
      showToast,
      notify,
      submitDocument,
      approveRequirement,
      requestResubmission,
      confirmActivity,
      createEmployee,
      createStaffUser,
      updateAccount,
      markAllRead,
      sendReminder,
      getEmployee,
    ],
  );

  //save the users refreshtoken on site refresh
  useEffect(() => {
    async function refreshAuth() {
      try {
        //activate
        const res = await api.post("/auth/refresh");
        //create another access token based on refresh
        const { accessToken, user } = res.data;
        const updatedSession = {
          accessToken,
          ...user,
        };
        //activate
        setSession(updatedSession);
        console.log("from refresh", updatedSession);
      } catch (error) {
        setSession(null);
        console.log("On Refresh:", error.response.data.message);
      } finally {
        setSessionLoading(false);
      }
    }
    //call refresh
    refreshAuth();
  }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
