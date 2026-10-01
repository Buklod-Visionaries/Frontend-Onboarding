import { useQuery } from "@tanstack/react-query";
import { fetchAllEmployees } from "../api/employees";

export function useEmployees(token) {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => fetchAllEmployees(token),
    enabled: !!token,
  });
}
