import api from "../lib/axios";

export async function fetchReports(token, department) {
  const res = await api.get("/reports", {
    params: {
      department,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
