import api from "../lib/axios";

export async function requestPasswordReset(email) {
  const res = await api.post("/auth/request-password-reset", { email });
  return res.data;
}

export async function firstLogin(token, email, tempPass, newPass) {
  const res = await api.post(
    "/auth/first-login",
    { email, tempPass, newPass },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}
