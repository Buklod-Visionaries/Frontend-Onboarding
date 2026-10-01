import api from "../lib/axios";

export async function getAllEmployees(token) {
  const res = await api.get("/employees", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
