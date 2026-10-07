import api from "../lib/axios";

export async function fetchAllOwnNotifications(token) {
  const res = await api.get("/notifications/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function readAllOwnNotifications(token) {
  const res = await api.patch(
    "/notifications/me/read-all",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}

export async function deleteAllOwnNotifications(token) {
  const res = await api.delete("/notifications/me/delete-all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
