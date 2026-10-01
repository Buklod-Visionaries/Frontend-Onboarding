import { useQuery } from "@tanstack/react-query";
import { fetchAllEmployees, fetchAllDepEmployees } from "../api/employees";

export function useEmployees(token) {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => fetchAllEmployees(token),
    enabled: !!token,
  });
}

export function useDepEmployees(token) {
  return useQuery({
    queryKey: ["depEmployees"],
    queryFn: () => fetchAllDepEmployees(token),
    enabled: !!token,
  });
}
