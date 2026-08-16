import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FadeLoader } from "react-spinners";
import { AiFillStar, AiFillHeart } from "react-icons/ai";
import { FiHeart, FiMapPin } from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../backend";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../context/CurrencyContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const Wishlist = () => {
  const [removingId, setRemovingId] = useState(null);
  const { user, toggleWishlist } = useAuth();
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      try {
        const res = await api.get("/auth/wishlist");
        return Array.isArray(res.data?.wishlist) ? res.data.wishlist : [];
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        return [];
      }
    },
    enabled: Boolean(user?._id),
    staleTime: 3 * 60 * 1000,
  });

  const handleRemoveFromWishlist = async (e, houseId) => {
    e.preventDefault();
    e.stopPropagation();

    if (removingId === houseId) return;
    setRemovingId(houseId);

    try {
      // Optimistically remove from cache for instantaneous UI feedback
      queryClient.setQueryData(["wishlist", user?._id], (old) =>
        (old || []).filter((item) => item._id !== houseId)
      );

      const res = await toggleWishlist(houseId);
      if (res?.success === 1) {
        toast.success("Removed from wishlist", {
          icon: "💔",
          style: {
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "600",
          },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?._id] });
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[60vh]">
        <FadeLoader color="#ff385c" />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10 py-10 min-h-[75vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#222222] dark:text-white tracking-tight"
          >
            Wishlists
          </motion.h1>
          <motion.p
            key={wishlistItems.length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm sm:text-base text-[#717171] dark:text-[#a0a0a0] mt-1"
          >
            {wishlistItems.length} {wishlistItems.length === 1 ? "stay" : "stays"} saved for your next trip
          </motion.p>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <AnimatePresence mode="popLayout">
        {wishlistItems.length === 0 ? (
          <motion.div
            key="empty-wishlist"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center bg-neutral-50 dark:bg-[#181818] rounded-3xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#ff385c] flex items-center justify-center mb-4 shadow-xs">
              <FiHeart size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#111827] dark:text-white">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-[#717171] dark:text-[#a0a0a0] mt-2 max-w-sm">
              As you search, tap the heart icon on any motel stay to save your favorite places here.
            </p>
            <Link to="/" className="mt-6">
              <Button className="rounded-xl px-6 py-2.5 font-bold shadow-md bg-[#ff385c] hover:bg-[#d90b63] text-white">
                Explore stays
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {wishlistItems.map((house) => {
              const photo = house?.photos?.[0];
              const locationStr =
                house?.location?.city?.name ||
                house?.location?.country?.name ||
                house?.location?.addressLineOne ||
                "Global Destination";

              return (
                <motion.div
                  layout
                  key={house._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    y: 20,
                    transition: { duration: 0.35, ease: "easeInOut" },
                  }}
                  transition={{
                    layout: { type: "spring", stiffness: 350, damping: 28 },
                  }}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Link
                    to={`/rooms/${house._id}`}
                    className="block relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800"
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={house.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                        No image
                      </div>
                    )}

                    {/* Remove Wishlist Button with Heart Beat Animation */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFromWishlist(e, house._id)}
                      disabled={removingId === house._id}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-xs text-[#ff385c] hover:scale-115 active:scale-95 transition-all duration-200 shadow-md cursor-pointer z-10"
                      aria-label="Remove from wishlist"
                      title="Remove from wishlist"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <AiFillHeart size={18} />
                      </motion.div>
                    </button>
                  </Link>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-[#111827] dark:text-white truncate flex-1">
                          {house.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#111827] dark:text-white shrink-0">
                          <AiFillStar className="text-amber-500" size={14} />
                          <span>{house.ratings || "New"}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#717171] dark:text-[#a0a0a0] flex items-center gap-1 mt-1 truncate">
                        <FiMapPin size={12} className="shrink-0" />
                        {locationStr}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <span className="text-xs text-[#717171] dark:text-[#a0a0a0]">
                        {house.houseType || "Motel"}
                      </span>
                      <div className="text-sm font-bold text-[#111827] dark:text-white">
                        {formatPrice(house.basePrice)}{" "}
                        <span className="text-xs font-normal text-[#717171] dark:text-[#a0a0a0]">
                          / night
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
