import { useQuery } from "@tanstack/react-query";
import { fetchAllUsers } from "../api/users";

export function useUsers(token) {
  return useQuery({
    queryKey: ["users"], //represents users data
    queryFn: () => fetchAllUsers(token), //when "users" are needed call fetchAllUsers
    enabled: !!token, //
  });
}
