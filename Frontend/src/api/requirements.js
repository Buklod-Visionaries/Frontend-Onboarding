import api from "../lib/axios";

export async function fetchAllRequirements(token) {
  const res = await api.get("/employee-requirements", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
