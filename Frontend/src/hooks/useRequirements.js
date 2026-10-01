import { useQuery } from "@tanstack/react-query";
import { fetchAllRequirements, fetchAllDepEmpReq } from "../api/requirements";

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
