import api from "../lib/axios";

export async function fetchAllEmployees(token) {
  const res = await api.get("/employees", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

//for dep rep RBAC only see their own employees with same department
export async function fetchAllDepEmployees(token) {
  const res = await api.get("/employees/department", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
