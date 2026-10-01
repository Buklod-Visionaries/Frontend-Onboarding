import { useQuery } from "@tanstack/react-query";
import { fetchAllRequirements } from "../api/requirements";

export function useRequirements(token) {
  return useQuery({
    queryKey: ["requirements"],
    queryFn: () => fetchAllRequirements(token),
    enabled: !!token,
  });
}
