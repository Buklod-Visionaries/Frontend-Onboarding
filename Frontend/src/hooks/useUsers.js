import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchAllUsers,
  fetchCurrentUser,
  // getCurrentEmployeeUser,
  resetTempPass,
  updateOwnUserPass,
  changeUserStatus,
} from "../api/users";
import { useQueryClient } from "@tanstack/react-query";

export function useUsers(token) {
  return useQuery({
    queryKey: ["users"], //represents users data
    queryFn: () => fetchAllUsers(token), //when "users" are needed call fetchAllUsers
    enabled: !!token, //
    refetchInterval: 30000,
  });
}

export function useCurrentUser(token) {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchCurrentUser(token),
    enabled: !!token,
  });
}

// export function useCurrentEmployeeUser(token) {
//   return useQuery({
//     queryKey: ["currentEmployeeUser"],
//     queryFn: () => getCurrentEmployeeUser(token),
//     enabled: !!token,
//   });
// }

export function useResetTempPass(token) {
  return useMutation({
    mutationFn: ({ userId, tempPass }) =>
      resetTempPass(token, userId, tempPass),
  });
}

export function useUpdateOwnUserPass(token) {
  return useMutation({
    mutationFn: ({ currentPass, password }) =>
      updateOwnUserPass(token, currentPass, password),
  });
}

export function useChangeUserStatus(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => changeUserStatus(token, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["requirements"],
      });
    },
  });
}
