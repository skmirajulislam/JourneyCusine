import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import api from "../backend";

export function useActiveReservations() {
  const user = useSelector((state) => state.user?.userDetails);

  const { data: myBookings = [], isLoading } = useQuery({
    queryKey: ["myBookings", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      try {
        const res = await api.get("/reservations/my_bookings");
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Active reservations: confirmed, not cancelled, not refunded, checkout date >= today
  const activeBookings = myBookings.filter((r) => {
    if (
      r.status === "refunded" ||
      r.status === "cancelled" ||
      r.status === "cancellation_requested"
    ) {
      return false;
    }
    const outDate = new Date(r.checkOut || r.checkIn || Date.now());
    outDate.setHours(23, 59, 59, 999);
    return outDate >= todayStart;
  });

  const isListingReserved = (listingId) => {
    if (!listingId || !activeBookings.length) return false;
    const targetId = String(listingId);
    return activeBookings.some((r) => {
      const resListingId = typeof r.listingId === "object" ? r.listingId?._id : r.listingId;
      return String(resListingId) === targetId;
    });
  };

  const getListingReservation = (listingId) => {
    if (!listingId || !activeBookings.length) return null;
    const targetId = String(listingId);
    return activeBookings.find((r) => {
      const resListingId = typeof r.listingId === "object" ? r.listingId?._id : r.listingId;
      return String(resListingId) === targetId;
    }) || null;
  };

  return {
    activeBookings,
    isListingReserved,
    getListingReservation,
    isLoading,
  };
}
