import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../backend";
import { toast } from "react-hot-toast";

/**
 * Custom hook for Host Listings & Reservations data powered by TanStack Query
 */
export function useHostData() {
  const queryClient = useQueryClient();

  // Host Listings Query
  const {
    data: hostHouses = [],
    isLoading: isLoadingHouses,
    refetch: refetchHouses,
  } = useQuery({
    queryKey: ["hostHouses"],
    queryFn: async () => {
      try {
        const res = await api.post("/auth/get_user_details");
        if (res.data && res.data.house_data) {
          return res.data.house_data;
        }
        return [];
      } catch (err) {
        console.error("Error fetching host houses:", err);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  // Host Reservations Query
  const {
    data: authorReservations = [],
    isLoading: isLoadingReservations,
    refetch: refetchReservations,
  } = useQuery({
    queryKey: ["authorReservations"],
    queryFn: async () => {
      try {
        const res = await api.get("/reservations/get_author_reservations");
        if (res.status === 200) {
          return res.data || [];
        }
        return [];
      } catch (err) {
        console.error("Error fetching author reservations:", err);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  // Delete Listing Mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (houseId) => {
      const res = await api.delete(`/house/delete/${houseId}`);
      return res.data;
    },
    onSuccess: (_, houseId) => {
      toast.success("Listing deleted successfully");
      queryClient.setQueryData(["hostHouses"], (old) =>
        (old || []).filter((h) => h._id !== houseId)
      );
      queryClient.invalidateQueries({ queryKey: ["hostHouses"] });
      queryClient.invalidateQueries({ queryKey: ["allListing"] });
    },
    onError: () => {
      toast.error("Failed to delete listing");
    },
  });

  // Edit Listing Mutation
  const editListingMutation = useMutation({
    mutationFn: async ({ houseId, updateData }) => {
      const res = await api.put(`/house/update/${houseId}`, updateData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Listing updated successfully");
      queryClient.invalidateQueries({ queryKey: ["hostHouses"] });
      queryClient.invalidateQueries({ queryKey: ["allListing"] });
    },
    onError: () => {
      toast.error("Failed to update listing");
    },
  });

  return {
    hostHouses,
    housesData: hostHouses, // Alias
    isLoadingHouses,
    refetchHouses,
    authorReservations,
    isLoadingReservations,
    refetchReservations,
    deleteListing: deleteListingMutation.mutateAsync,
    editListing: editListingMutation.mutateAsync,
    isDeleting: deleteListingMutation.isPending,
    isEditing: editListingMutation.isPending,
  };
}

/**
 * Single Listing Details Query
 */
export function useListingDetails(listingId) {
  return useQuery({
    queryKey: ["listingDetails", listingId],
    queryFn: async () => {
      if (!listingId) return null;
      const res = await api.post("/house/room_details", { id: listingId });
      if (res.status === 200) {
        return res.data;
      }
      return null;
    },
    enabled: Boolean(listingId),
    staleTime: 5 * 60 * 1000,
  });
}
