import api from "../lib/axios";

export async function fetchAllUsers(token) {
  const res = await api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchCurrentUser(token) {
  const res = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function getCurrentEmployeeUser(token) {
  const res = await api.get("/employees/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function resetTempPass(token, userId, tempPass) {
  const res = await api.patch(
    `/users/${userId}/reset-password`,
    { tempPass },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}

export async function updateOwnUserPass(token, password) {
  const res = await api.post(
    "/users/me/update-password",
    { password },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}

export async function changeUserStatus(token, id, status) {
  const res = await api.patch(
    `/users/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}
