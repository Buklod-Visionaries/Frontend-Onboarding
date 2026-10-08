import api from "../lib/axios";

export async function createNotification(token, user, title, message) {
  const res = await api.post(
    "/notifications",
    { user, title, message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}

export async function fetchAllOwnNotifications(token, limit) {
  const res = await api.get("/notifications/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      limit: limit, //set limit
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
