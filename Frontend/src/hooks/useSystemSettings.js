import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSystemSettings,
  updateSystemSettings,
} from "../api/systemSettings";

export function useFetchSystemSettings(token) {
  return useQuery({
    queryKey: ["systemSettings"],
    queryFn: () => fetchSystemSettings(token),
    enabled: !!token,
  });
}

export function useUpdateSystemSettings(token) {
  //
  const queryClient = useQueryClient();
  //
  return useMutation({
    mutationFn: ({ deadlineDays, reminderDaysBefore }) =>
      updateSystemSettings(token, deadlineDays, reminderDaysBefore),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["systemSettings"],
      });
    },
  });
}
