import { useQuery } from "@tanstack/react-query";
import {
  fetchAllRequirements,
  fetchAllDepEmpReq,
  fetchMyRequirements,
} from "../api/requirements";

export function useRequirements(token) {
  return useQuery({
    queryKey: ["requirements"],
    queryFn: () => fetchAllRequirements(token),
    enabled: !!token,
  });
}

export function useDepEmpReq(token) {
  return useQuery({
    queryKey: ["depRequirements"],
    queryFn: () => fetchAllDepEmpReq(token),
    enabled: !!token,
  });
}

export function useMyRequirements(token) {
  return useQuery({
    queryKey: ["myRequirements"],
    queryFn: () => fetchMyRequirements(token),
    enabled: !!token,
  });
}
