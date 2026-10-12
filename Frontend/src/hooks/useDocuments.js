import { useQuery } from "@tanstack/react-query";
import { fetchPendingDocuments, fetchExistingDocument } from "../api/documents";

export function usePendingDocuments(token) {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => fetchPendingDocuments(token),
    enabled: !!token,
    refetchInterval: 5000,
    refetchOnMount: "always",
  });
}

export function useExistingDocument(token, paramsId) {
  return useQuery({
    queryKey: ["existingDocument", paramsId],
    queryFn: () => fetchExistingDocument(token, paramsId),
    enabled: !!token && !!paramsId,
  });
}
