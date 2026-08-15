/* eslint-disable react/prop-types */
import { useState } from "react";
import { useSelector } from "react-redux";
import { AiFillStar } from "react-icons/ai";
import { FiTag, FiCheckCircle, FiX, FiAlertCircle } from "react-icons/fi";
import { PulseLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import api from "../../backend";
import { useCurrency } from "../../context/CurrencyContext";

const Listing = ({ searchParamsObj, appliedCoupon, setAppliedCoupon }) => {
  const listingData = useSelector(
    (state) => state.house.listingDetails.listing
  );
  const { formatPrice, currency } = useCurrency();

  const [couponInput, setCouponInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const listingSpace =
    listingData?.privacyType === "An entire place" ? "Entire" : "Shared";
  const listingType = listingData?.houseType;

  const nightStaying = parseInt(searchParamsObj?.nightStaying, 10) || 1;
  const rawBaseUSD = Number(listingData?.basePrice) || 0;
  const baseUSD = rawBaseUSD * nightStaying;

  // Calculate discount in USD
  const discountUSD = appliedCoupon?.discountAmount || 0;
  const discountedBaseUSD = Math.max(0, baseUSD - discountUSD);
  const taxUSD = Math.round((discountedBaseUSD * 14) / 100);
  const totalUSD = discountedBaseUSD + taxUSD;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      toast.error("Please enter a discount promo code");
      return;
    }

    try {
      setIsValidating(true);
      const res = await api.post("/coupons/validate", {
        code: couponInput.trim().toUpperCase(),
        listingId: listingData?._id,
        subtotalUSD: baseUSD,
      });

      if (res.data?.valid) {
        setAppliedCoupon(res.data);
        setCouponInput("");
        toast.success(res.data.message || "Promo code applied successfully!");
      } else {
        toast.error(res.data?.error || "Invalid promo code");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error(
        error.response?.data?.error || "Invalid or expired promo code"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast("Promo code removed", { icon: "ℹ️" });
  };

  return (
    <div>
      <div className="border border-[#dddddd] dark:border-[#444444] rounded-2xl p-6 flex flex-col sticky top-28 min-h-[200px] bg-white dark:bg-[#1e1e1e] shadow-sm">
        {/* Listing preview */}
        <div className="flex flex-row gap-3">
          <img
            src={listingData?.photos?.[0]}
            alt="listing houses"
            className="rounded-xl object-cover w-[110px] h-[96px] sm:w-[124px] sm:h-[106px]"
          />
          <div className="flex flex-col justify-between flex-1">
            <span className="flex flex-col gap-0.5">
              <p className="text-xs text-[#717171] dark:text-[#a0a0a0]">
                {listingSpace} {listingType}
              </p>
              <p className="text-sm font-semibold text-[#222222] dark:text-[#e5e7eb] line-clamp-2">
                {listingData?.title}
              </p>
            </span>
            <span className="text-xs text-[#222222] dark:text-[#e5e7eb] flex flex-row gap-1 items-center mt-1">
              <AiFillStar size={15} className="text-amber-500" />
              <strong className="font-semibold">{listingData?.ratings ? listingData?.ratings : "New"}</strong>
              {listingData?.reviews && (
                <span className="text-gray-400">· {listingData?.reviews} reviews</span>
              )}
            </span>
          </div>
        </div>

        <hr className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-5" />

        {/* Promo Code Section */}
        <div className="mb-2">
          {!appliedCoupon ? (
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FiTag className="text-[#ff385c]" size={13} />
                Have a Promo / Discount Code?
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. SUMMER20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-neutral-50 dark:bg-[#252525] text-xs font-mono uppercase font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#ff385c]"
                />
                <button
                  type="submit"
                  disabled={isValidating || !couponInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#222222] dark:bg-white text-white dark:text-[#222222] text-xs font-bold hover:bg-black dark:hover:bg-neutral-200 transition cursor-pointer disabled:opacity-40"
                >
                  {isValidating ? (
                    <PulseLoader size={5} color="#888888" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" size={16} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                      {appliedCoupon.coupon?.code}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ({appliedCoupon.coupon?.discountType === "percentage"
                        ? `${appliedCoupon.coupon?.discountRate}% OFF`
                        : `${formatPrice(appliedCoupon.discountAmount)} OFF`})
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Saved {formatPrice(discountUSD)} on accommodation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="p-1 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition cursor-pointer"
                title="Remove promo code"
              >
                <FiX size={15} />
              </button>
            </div>
          )}
        </div>

        <hr className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-4" />

        {/* Price Breakdown */}
        <div className="flex flex-col gap-2.5 text-xs text-[#484848] dark:text-[#c0c0c0]">
          <h5 className="text-base text-[#222222] dark:text-white font-bold pb-0.5">
            Price Details
          </h5>

          <div className="flex justify-between">
            <span>
              {formatPrice(rawBaseUSD)} × {nightStaying} night{nightStaying > 1 ? "s" : ""}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(baseUSD)}
            </span>
          </div>

          {appliedCoupon && discountUSD > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <FiTag size={11} /> Discount ({appliedCoupon.coupon?.code})
              </span>
              <span>- {formatPrice(discountUSD)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Taxes (14%)</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(taxUSD)}
            </span>
          </div>
        </div>

        <hr className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-4" />

        <div className="flex flex-row justify-between text-base text-[#222] dark:text-white font-bold">
          <div>
            <p>Total ({currency})</p>
            {appliedCoupon && (
              <p className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                You saved {formatPrice(discountUSD)}
              </p>
            )}
          </div>
          <p className="text-[#ff385c] text-lg">{formatPrice(totalUSD)}</p>
        </div>
      </div>
    </div>
  );
};

export default Listing;
