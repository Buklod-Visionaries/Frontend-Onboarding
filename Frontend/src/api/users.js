import api from "../lib/axios";

export async function fetchAllUsers(token) {
  const res = await api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
