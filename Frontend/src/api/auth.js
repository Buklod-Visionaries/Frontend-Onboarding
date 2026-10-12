import api from "../lib/axios";

export async function requestPasswordReset(email) {
  const res = await api.post("/auth/request-password-reset", { email });
  return res.data;
}
