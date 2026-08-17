 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillStar, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useCurrency } from "../../context/CurrencyContext";
import { useActiveReservations } from "../../hooks/useActiveReservations";
import { Badge } from "@/components/ui/badge";

const ListingPreviewCard = ({ listingData, showBeforeTaxPrice }) => {
  const { user, toggleWishlist } = useAuth();
  const { formatPrice } = useCurrency();
  const { isListingReserved } = useActiveReservations();
  const [isUpdating, setIsUpdating] = useState(false);

  const baseUSD = Number(listingData?.basePrice) || 0;
  const taxUSD = Math.round((baseUSD * 14) / 100);
  const priceAfterTaxesUSD = baseUSD + taxUSD;

  const houseId = listingData?._id;
  const isSaved = (user?.wishlist || []).some(
    (id) => (typeof id === "object" ? id?._id : id)?.toString() === houseId?.toString()
  );

  const hasActiveReservation = isListingReserved(houseId);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }
    if (!houseId || isUpdating) return;

    try {
      setIsUpdating(true);
      const res = await toggleWishlist(houseId);
      if (res?.success === 1) {
        toast.success(res.message);
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="group bg-transparent w-full">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-transparent"
        >
          <div className="relative h-[310px] md:h-[277px] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <img
              src={listingData?.photos[0]}
              alt={listingData?.title || "Listing preview"}
              className="w-full h-full object-cover object-center rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
            />

            {/* Reserved Badge */}
            {hasActiveReservation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 15 }}
                className="absolute top-3 left-3 z-10"
              >
                <Badge variant="success" className="gap-1 shadow-lg text-[11px] sm:text-xs font-bold py-1 px-2.5">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <Check size={11} className="stroke-[3]" />
                  </span>
                  <span>Reserved</span>
                </Badge>
              </motion.div>
            )}

            {/* Heart / Wishlist button */}
            <motion.button
              type="button"
              onClick={handleToggleWishlist}
              disabled={isUpdating}
              aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.75 }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-all duration-200 cursor-pointer z-10 shadow-sm"
            >
              <AnimatePresence mode="wait">
                {isSaved ? (
                  <motion.span
                    key="filled"
                    initial={{ scale: 0.4 }}
                    animate={{ scale: [1.35, 0.85, 1] }}
                    exit={{ scale: 0.4 }}
                    transition={{ type: "spring", damping: 12, stiffness: 350 }}
                    className="block"
                  >
                    <AiFillHeart size={20} className="text-[#ff385c]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="empty"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <AiOutlineHeart size={20} className="text-white" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Details below image - completely transparent with no box */}
          <div className="flex flex-row justify-between items-start w-full mt-2.5 px-0.5 bg-transparent">
            <div className="flex flex-col gap-0.5 min-w-0 pr-2">
              <p className="text-sm font-bold text-[#111827] dark:text-white truncate">
                {listingData?.location?.city?.name || "City"},{" "}
                {listingData?.location?.country?.name || "Country"}
              </p>
              {showBeforeTaxPrice && (
                <p className="text-xs text-[#717171] dark:text-[#a0a0a0]">
                  After tax {formatPrice(priceAfterTaxesUSD)}{" "}
                  <span className="font-normal">night</span>
                </p>
              )}
              <p className="text-sm font-semibold text-[#111827] dark:text-white mt-0.5">
                {formatPrice(baseUSD)}{" "}
                <span className="font-normal text-xs text-[#717171] dark:text-[#a0a0a0]">night</span>
              </p>
            </div>
            {/* ratings / new status */}
            <div className="flex flex-row gap-1 items-center text-[#111827] dark:text-white shrink-0 pt-0.5">
              <AiFillStar size={15} className="text-amber-500 shrink-0" />
              <p className="text-sm font-medium">
                {listingData?.ratings ? listingData.ratings : "New"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ListingPreviewCard;
