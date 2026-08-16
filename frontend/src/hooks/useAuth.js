import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../backend";
import { toast } from "react-hot-toast";

/**
 * Custom hook for User Authentication & Profile State powered by TanStack React Query
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // Query: Current authenticated user details
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const rawToken = localStorage.getItem("accessToken");
      if (!rawToken) {
        return null;
      }

      try {
        const res = await api.post("/auth/get_user_details");
        if (res.data && res.data.status === 200 && res.data.user_details) {
          // Sync houses if returned
          if (res.data.house_data) {
            queryClient.setQueryData(["hostHouses"], res.data.house_data);
          }
          return res.data.user_details;
        }
        // If status is not 200, session expired or invalid
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;
      } catch {
        // Clear invalid tokens on 401/403 or network failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Helper to store tokens safely
  const storeTokens = (userData) => {
    if (userData?.accessToken) {
      localStorage.setItem("accessToken", JSON.stringify(userData.accessToken));
    }
    if (userData?.refreshToken) {
      localStorage.setItem("refreshToken", JSON.stringify(userData.refreshToken));
    }
  };

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await api.post("/auth/log_in", { email, password });
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.success === 1 && data?.user_details) {
        storeTokens(data);
        queryClient.setQueryData(["authUser"], data.user_details);
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        queryClient.invalidateQueries({ queryKey: ["hostHouses"] });
      }
    },
  });

  // Signup Mutation
  const signupMutation = useMutation({
    mutationFn: async (signupData) => {
      const res = await api.post("/auth/sign_up", signupData, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.success === 1 && data?.user_details) {
        storeTokens(data);
        queryClient.setQueryData(["authUser"], data.user_details);
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await api.post("/auth/logout");
      } catch {
        // Proceed even if server unreachable
      }
    },
    onSettled: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentHouseId");
      queryClient.setQueryData(["authUser"], null);
      queryClient.setQueryData(["wishlist"], []);
      queryClient.setQueryData(["hostHouses"], []);
      queryClient.clear();
      toast.success("Logged out successfully");
    },
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
      // Optimistically update or call API
      return updatedData;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["authUser"], (old) => {
        if (!old) return updatedData;
        return { ...old, ...updatedData };
      });
    },
  });

  // Wishlist Toggle Mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async (houseId) => {
      const res = await api.post(
        "/auth/wishlist/toggle",
        { houseId },
        { headers: { "Content-Type": "application/json" } }
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.success === 1 && data?.wishlist) {
        queryClient.setQueryData(["authUser"], (oldUser) => {
          if (!oldUser) return oldUser;
          return { ...oldUser, wishlist: data.wishlist };
        });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      }
    },
  });

  // Set user directly (for synchronous updates like login/signup)
  const setUser = (userData) => {
    if (!userData) {
      queryClient.setQueryData(["authUser"], null);
    } else {
      const userObj = userData.user_details || userData;
      storeTokens(userData);
      queryClient.setQueryData(["authUser"], userObj);
    }
  };

  const updateWishlist = (wishlistArray) => {
    queryClient.setQueryData(["authUser"], (oldUser) => {
      if (!oldUser) return oldUser;
      return { ...oldUser, wishlist: wishlistArray };
    });
  };

  return {
    user,
    userDetails: user, // Backward compatibility alias
    isLoading,
    isError,
    isAuthenticated: Boolean(user),
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutate,
    setUser,
    updateProfile: updateProfileMutation.mutate,
    toggleWishlist: toggleWishlistMutation.mutateAsync,
    updateWishlist,
    refetchUser: refetch,
  };
}
