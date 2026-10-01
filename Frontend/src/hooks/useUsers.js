import { useQuery } from "@tanstack/react-query";
import { fetchAllUsers, fetchCurrentUser } from "../api/users";

export function useUsers(token) {
  return useQuery({
    queryKey: ["users"], //represents users data
    queryFn: () => fetchAllUsers(token), //when "users" are needed call fetchAllUsers
    enabled: !!token, //
  });
}

export function useCurrentUser(token) {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchCurrentUser(token),
    enabled: !!token,
  });
}
