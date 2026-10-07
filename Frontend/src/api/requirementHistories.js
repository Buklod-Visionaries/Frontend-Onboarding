import api from "../lib/axios";

export async function fetchSpecificEmpReqHistories(token, requirementId) {
  const res = await api.get(
    `/employee-requirement-history/employee-requirement/${requirementId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}
