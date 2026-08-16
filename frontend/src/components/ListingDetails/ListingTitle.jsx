import { useState } from "react";
import { AiFillStar, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../../backend";
import { updateWishlist } from "../../redux/actions/userActions";
import AuthenticationPopUp from "../popUp/authentication/AuthenticationPopUp";

/* eslint-disable react/prop-types */
const ListingTitle = ({ listingData }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.userDetails);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const houseId = listingData?._id;
  const isSaved = (user?.wishlist || []).some(
    (id) => (typeof id === "object" ? id?._id : id)?.toString() === houseId?.toString()
  );

  const handleToggleWishlist = async () => {
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
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col text-[#222222] dark:text-[#e5e7eb]">
        {/* title */}
        <h1 className="text-xl md:text-2xl font-medium">{listingData?.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-5 items-center justify-end">
          <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-2 col-span-4">
            {/* ratings */}
            <div className="flex flex-row items-center gap-1">
              {listingData?.ratings ? (
                <>
                  <AiFillStar size={16} />
                  <span className="text-xs sm:text-sm">{listingData?.ratings}</span>
                </>
              ) : (
                <>
                  <AiFillStar size={16} />
                  <span className="text-xs sm:text-sm">New</span>
                </>
              )}
            </div>
            <span> · </span>
            <span className="text-xs sm:text-sm">
              {listingData?.reviews ? listingData?.reviews : "No reviews"}
            </span>
            <span> · </span>
            {/* location */}
            <span className="text-xs sm:text-sm font-medium underline">
              {listingData?.location?.addressLineOne
                ? listingData?.location?.addressLineOne
                : listingData?.location?.addressLineTwo
                ? listingData?.location?.addressLineTwo
                : listingData?.location?.country?.name}
            </span>
          </div>
          {/* save wishlist options */}
          <div className="col-span-1 md:flex justify-end w-full hidden">
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={isUpdating}
              className="flex items-center justify-center p-2.5 rounded-full bg-white dark:bg-[#2a2a2a] hover:bg-[#f1f1f1] dark:hover:bg-[#333333] transition duration-200 ease-in border border-[#dddddd] dark:border-[#444444] shadow-xs cursor-pointer"
              aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
              title={isSaved ? "Saved to wishlist" : "Save to wishlist"}
            >
              {isSaved ? (
                <AiFillHeart size={20} className="text-[#ff385c]" />
              ) : (
                <AiOutlineHeart size={20} className="text-neutral-700 dark:text-neutral-200" />
              )}
            </button>
          </div>
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

export default ListingTitle;
