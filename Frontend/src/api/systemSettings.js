import api from "../lib/axios";

export async function fetchSystemSettings(token) {
  const res = await api.get("/system-settings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function updateSystemSettings(
  token,
  deadlineDays,
  reminderDaysBefore,
) {
  const res = await api.put(
    "/system-settings",
    { deadlineDays, reminderDaysBefore },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}
