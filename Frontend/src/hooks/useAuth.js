import { useQuery, useMutation } from "@tanstack/react-query";
import { requestPasswordReset, firstLogin } from "../api/auth";

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email) => requestPasswordReset(email),
  });
}

export function useFirstLogin(token) {
  return useMutation({
    mutationFn: ({ email, tempPass, newPass }) =>
      firstLogin(token, email, tempPass, newPass),
  });
}
