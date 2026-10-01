import { useQuery } from "@tanstack/react-query";
import { fetchPendingDocuments } from "../api/documents";

export function usePendingDocuments(token) {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => fetchPendingDocuments(token),
    enabled: !!token,
  });
}
