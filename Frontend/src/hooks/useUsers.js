import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchAllUsers,
  fetchCurrentUser,
  getCurrentEmployeeUser,
  resetTempPass,
} from "../api/users";

export function useUsers(token) {
  return useQuery({
    queryKey: ["users"], //represents users data
    queryFn: () => fetchAllUsers(token), //when "users" are needed call fetchAllUsers
    enabled: !!token, //
    refetchInterval: 5000,
  });
}

export function useCurrentUser(token) {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchCurrentUser(token),
    enabled: !!token,
  });
}

export function useCurrentEmployeeUser(token) {
  return useQuery({
    queryKey: ["currentEmployeeUser"],
    queryFn: () => getCurrentEmployeeUser(token),
    enabled: !!token,
  });
}

export function useResetTempPass(token) {
  return useMutation({
    mutationFn: ({userId, tempPass}) => resetTempPass(token, userId, tempPass),
  });
}
