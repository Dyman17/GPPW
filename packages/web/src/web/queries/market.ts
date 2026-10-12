import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
export function useCatalog() {
  return useQuery(orpc.market.catalog.queryOptions());
}
export function useItem(id: string) {
  return useQuery(orpc.market.item.queryOptions({ input: { id }, enabled: !!id }));
}
export function useMine(enabled: boolean) {
  return useQuery(orpc.market.mine.queryOptions({ enabled }));
}
export function useProfile(enabled: boolean) {
  return useQuery(orpc.market.profile.queryOptions({ enabled }));
}
export function useSaved(enabled: boolean) {
  return useQuery(orpc.market.saved.queryOptions({ enabled }));
}
export function useBookings(enabled: boolean) {
  return useQuery(orpc.market.bookings.queryOptions({ enabled }));
}
export function useModeration(enabled: boolean) {
  return useQuery(orpc.market.moderation.queryOptions({ enabled }));
}
export function useChats(enabled: boolean) {
  return useQuery(orpc.chats.list.queryOptions({ enabled, refetchInterval: 5000 }));
}
export function useMessages(id: string) {
  return useQuery(
    orpc.chats.messages.queryOptions({ input: { id }, enabled: !!id, refetchInterval: 3000 }),
  );
}
export function useActions() {
  const q = useQueryClient();
  const onSuccess = () => q.invalidateQueries();
  return {
    save: useMutation(orpc.market.save.mutationOptions({ onSuccess })),
    publish: useMutation(orpc.market.publish.mutationOptions({ onSuccess })),
    settings: useMutation(orpc.market.settings.mutationOptions({ onSuccess })),
    withdraw: useMutation(orpc.market.withdraw.mutationOptions({ onSuccess })),
    moderate: useMutation(orpc.market.moderate.mutationOptions({ onSuccess })),
    reserve: useMutation(orpc.market.reserve.mutationOptions({ onSuccess })),
    booking: useMutation(orpc.market.bookingAction.mutationOptions({ onSuccess })),
    openChat: useMutation(orpc.chats.open.mutationOptions({ onSuccess })),
    send: useMutation(orpc.chats.send.mutationOptions({ onSuccess })),
  };
}
