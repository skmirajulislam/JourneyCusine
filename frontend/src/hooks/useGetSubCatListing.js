import { useQuery } from "@tanstack/react-query";
import api from "../backend";

export const useGetSubCatListing = (cat) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["categoryListings", cat],
    queryFn: async () => {
      if (!cat) return [];
      try {
        const res = await api.post("/house/get_listing_with_cat", {
          category: cat,
        });
        return Array.isArray(res.data?.catBasedListing) ? res.data.catBasedListing : [];
      } catch (error) {
        console.error("Error fetching category listings:", error);
        return [];
      }
    },
    enabled: Boolean(cat),
    staleTime: 5 * 60 * 1000, // 5 mins cache
    gcTime: 15 * 60 * 1000,
  });

  return { isLoading, data };
};