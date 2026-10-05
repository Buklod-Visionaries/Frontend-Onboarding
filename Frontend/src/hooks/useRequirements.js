import { useQuery } from "@tanstack/react-query";
import {
  fetchAllRequirements,
  fetchAllDepEmpReq,
  fetchMyRequirements,
  fetchMySpecificRequirement,
  fetchSpecificEmployeeRequirements,
} from "../api/requirements";

export function useRequirements(token) {
  return useQuery({
    queryKey: ["requirements"],
    queryFn: () => fetchAllRequirements(token),
    enabled: !!token,
    refetchInterval: 5000,
  });
}

export function useDepEmpReq(token) {
  return useQuery({
    queryKey: ["depRequirements"],
    queryFn: () => fetchAllDepEmpReq(token),
    enabled: !!token,
    refetchInterval: 5000,
  });
}

export function useMyRequirements(token) {
  return useQuery({
    queryKey: ["myRequirements"],
    queryFn: () => fetchMyRequirements(token),
    enabled: !!token,
  });
}

export function useMySpecificRequirement(token, paramsId) {
  return useQuery({
    queryKey: ["myRequirement", paramsId],
    queryFn: () => fetchMySpecificRequirement(token, paramsId),
    enabled: !!token && !!paramsId,
  });
}

export function useSpecificEmployeeRequirements(token, paramsId) {
  return useQuery({
    queryKey: ["empRequirements", paramsId],
    queryFn: () => fetchSpecificEmployeeRequirements(token, paramsId),
    enabled: !!token && !!paramsId,
  });
}
