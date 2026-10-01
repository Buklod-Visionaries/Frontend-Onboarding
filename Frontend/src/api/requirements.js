import api from "../lib/axios";

export async function fetchAllRequirements(token) {
  const res = await api.get("/employee-requirements", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchAllDepEmpReq(token) {
  const res = await api.get("/employee-requirements/department", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchMyRequirements(token) {
  const res = await api.get("/employee-requirements/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchMySpecificRequirement(token, paramsId) {
  const res = await api.get(`/employee-requirements/me/${paramsId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
