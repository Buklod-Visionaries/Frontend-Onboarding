import { useQuery } from "@tanstack/react-query";
import {
  fetchAllEmployees,
  fetchAllDepEmployees,
  fetchCurrentEmployee,
  fetchSpecificEmployee,
} from "../api/employees";

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

export function useCurrentEmployee(token) {
  return useQuery({
    queryKey: ["currentEmployee"],
    queryFn: () => fetchCurrentEmployee(token),
    enabled: !!token,
  });
}

export function useSpecificEmployee(token, paramsId) {
  return useQuery({
    queryKey: ["employee", paramsId],
    queryFn: () => fetchSpecificEmployee(token, paramsId),
    enabled: !!token && !!paramsId,
  });
}
