import { useQuery } from "@tanstack/react-query";
import { fetchSpecificEmpReqHistories } from "../api/requirementHistories";

export function useSpecificEmpReqHistories(token, requirementId) {
  return useQuery({
    queryKey: ["specificEmpReqHistories", requirementId],
    queryFn: () => fetchSpecificEmpReqHistories(token, requirementId),
    enabled: !!token && !!requirementId,
  });
}
