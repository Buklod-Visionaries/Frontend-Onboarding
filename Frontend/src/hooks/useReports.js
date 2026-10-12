import { useQuery } from "@tanstack/react-query";
import { fetchReports } from "../api/reports";

export function useReports(token, department) {
  return useQuery({
    queryKey: ["reports", department],
    queryFn: () => fetchReports(token, department),
    enabled: !!token && !!department,
  });
}