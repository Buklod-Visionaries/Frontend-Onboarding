import api from "../lib/axios";

export async function fetchPendingDocuments(token) {
  const res = await api.get("/documents", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchExistingDocument(token, paramsId) {
  const res = await api.get(`/documents/employee-requirement/${paramsId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
