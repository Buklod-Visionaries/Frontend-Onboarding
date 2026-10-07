import { useQuery } from "@tanstack/react-query";
import {
  fetchSpecificEmpReqHistories,
  fetchAllEmpReqHistories,
} from "../api/requirementHistories";

export function useSpecificEmpReqHistories(token, requirementId) {
  return useQuery({
    queryKey: ["specificEmpReqHistories", requirementId],
    queryFn: () => fetchSpecificEmpReqHistories(token, requirementId),
    enabled: !!token && !!requirementId,
    refetchInterval: 30000,
  });
}

export function useAllEmpReqHistories(token, limit) {
  return useQuery({
    queryKey: ["empReqHistories", limit],
    queryFn: () => fetchAllEmpReqHistories(token, limit),
    enabled: !!token && !!limit,
  });
}
