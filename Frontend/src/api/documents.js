import api from "../lib/axios";

export async function fetchPendingDocuments(token) {
  const res = await api.get("/documents", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
