import { useQuery, useMutation } from "@tanstack/react-query";
import {
  createNotification,
  fetchAllOwnNotifications,
  readAllOwnNotifications,
  deleteAllOwnNotifications,
} from "../api/notifications";

export function useCreateNotif(token) {
  return useMutation({
    mutationFn: ({ user, title, message }) =>
      createNotification(token, user, title, message),
  });
}
export function useAllOwnNotif(token) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchAllOwnNotifications(token),
    enabled: !!token,
    refetchInterval: 10000, //every 10 seconds
  });
}

export function useReadAllOwnNotif(token) {
  return useMutation({
    mutationFn: () => readAllOwnNotifications(token),
  });
}

export function useDeleteAllOwnNotif(token) {
  return useMutation({
    mutationFn: () => deleteAllOwnNotifications(token),
  });
}
