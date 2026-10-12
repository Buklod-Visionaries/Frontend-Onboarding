import { useQuery, useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../api/auth";

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email) => requestPasswordReset(email),
  });
}
