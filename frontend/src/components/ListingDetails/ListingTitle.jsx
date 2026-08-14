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
        <p className="text-xl md:text-2xl font-medium">{listingData?.title}</p>
        <div className="grid grid-cols-1 md:grid-cols-5 items-center justify-end">
          <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-2 col-span-4">
            {/* ratings */}
            <p className="flex flex-row items-center gap-1">
              {listingData?.ratings ? (
                <>
                  <AiFillStar size={16} />
                  <p className="text-xs sm:text-sm">{listingData?.ratings}</p>
                </>
              ) : (
                <>
                  <AiFillStar size={16} />
                  <p className="text-xs sm:text-sm">New</p>
                </>
              )}
            </p>
            <span> · </span>
            <p className="text-xs sm:text-sm">
              {listingData?.reviews ? listingData?.reviews : "No reviews"}
            </p>
            <span> · </span>
            {/* location */}
            <p className="text-xs sm:text-sm font-medium underline">
              {listingData?.location?.addressLineOne
                ? listingData?.location?.addressLineOne
                : listingData?.location?.addressLineTwo
                ? listingData?.location?.addressLineTwo
                : listingData?.location?.country?.name}
            </p>
          </div>
          {/* save wishlist options */}
          <div className="col-span-1 md:flex justify-end w-full hidden">
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={isUpdating}
              className="flex flex-row-reverse gap-2 items-center cursor-pointer p-2 rounded-md bg-white dark:bg-[#2a2a2a] hover:bg-[#f1f1f1] dark:hover:bg-[#333333] transition duration-200 ease-in border border-[#dddddd] dark:border-[#444444]"
            >
              <span className="text-sm underline underline-offset-1 font-medium">
                {isSaved ? "Saved" : "Save"}
              </span>
              {isSaved ? (
                <AiFillHeart size={18} className="text-[#ff385c]" />
              ) : (
                <AiOutlineHeart size={18} />
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
