/* eslint-disable react/prop-types */
import { useState } from "react";
import { AiFillStar, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiCheck } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../../backend";
import { updateWishlist } from "../../redux/actions/userActions";
import AuthenticationPopUp from "../popUp/authentication/AuthenticationPopUp";
import { useCurrency } from "../../context/CurrencyContext";
import { useActiveReservations } from "../../hooks/useActiveReservations";

const ListingPreviewCard = ({ listingData, showBeforeTaxPrice }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.userDetails);
  const { formatPrice } = useCurrency();
  const { isListingReserved } = useActiveReservations();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
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
      setShowAuthPopup(true);
      return;
    }
    if (!houseId || isUpdating) return;

    try {
      setIsUpdating(true);
      const res = await api.post(
        "/auth/wishlist/toggle",
        { houseId },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data?.success === 1) {
        dispatch(updateWishlist(res.data.wishlist));
        toast.success(res.data.message);
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
      <div className="relative h-[310px] md:h-[277px] overflow-hidden rounded-xl group">
        <img
          src={listingData?.photos[0]}
          alt="Listing images"
          className="w-full h-[310px] md:h-[277px] object-cover object-center rounded-xl group-hover:scale-110 transition duration-500 ease-in-out cursor-pointer"
        />

        {/* Green Tick Reserved Badge (Only shown for active non-completed/non-cancelled bookings) */}
        {hasActiveReservation && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/95 text-white backdrop-blur-md text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-lg z-10 animate-in fade-in">
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <FiCheck size={11} className="stroke-[3]" />
            </span>
            <span>Reserved</span>
          </div>
        )}

        {/* Heart / Wishlist button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isUpdating}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/25 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-200 cursor-pointer z-10"
        >
          {isSaved ? (
            <AiFillHeart size={20} className="text-[#ff385c]" />
          ) : (
            <AiOutlineHeart size={20} className="text-white hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      <div className="flex flex-row justify-between items-start w-full mt-2">
        {/* listings details */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-[#111827] dark:text-white">
            {listingData?.location?.city?.name || "City"},{" "}
            {listingData?.location?.country?.name || "Country"}
          </p>
          {showBeforeTaxPrice && (
            <p className="text-sm text-[#717171] dark:text-[#a0a0a0]">
              After tax {formatPrice(priceAfterTaxesUSD)}{" "}
              <span className="font-normal">night</span>
            </p>
          )}
          <p className="text-sm font-semibold text-[#111827] dark:text-white">
            {formatPrice(baseUSD)}{" "}
            <span className="font-normal text-xs text-[#717171] dark:text-[#a0a0a0]">night</span>
          </p>
        </div>
        {/* ratings / new status */}
        <div className="flex flex-row gap-1 items-center text-[#111827] dark:text-white">
          {listingData?.ratings ? (
            <>
              <AiFillStar size={16} className="text-amber-500" />
              <p className="text-sm font-medium">{listingData?.ratings}</p>
            </>
          ) : (
            <>
              <AiFillStar size={16} className="text-amber-500" />
              <p className="text-sm font-medium">New</p>
            </>
          )}
        </div>
      </div>

      {showAuthPopup && (
        <AuthenticationPopUp
          popup={showAuthPopup}
          setPopup={setShowAuthPopup}
        />
      )}
    </>
  );
};

export default ListingPreviewCard;
