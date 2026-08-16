import { useState, useMemo } from "react";
import { useDateFormatting } from "../../hooks/useDateFormatting";
import { PulseLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../backend";
import { useAuth } from "../../hooks/useAuth";
import { useListingDetails } from "../../hooks/useHostData";
import {
  FiShield,
  FiCreditCard,
  FiCheckCircle,
  FiLock,
  FiGlobe,
  FiTag,
} from "react-icons/fi";
import { useCurrency } from "../../context/CurrencyContext";

const RazorpayIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M22.436 0l-11.91 7.773-1.164 4.293 4.908-3.207 1.055-3.882 7.111-4.977zm-9.336 9.429l-3.345 2.186-2.023 7.466 3.324-2.172 2.044-7.48zm-4.707 3.079l-4.148 2.711-4.245 8.781 4.385-2.866 4.008-8.626z" />
  </svg>
);

const Payment = ({ searchParamsObj, appliedCoupon, listingDataProp }) => {
  const { user: currentUser } = useAuth();
  const { data: fetchedDetails } = useListingDetails(searchParamsObj?.listingId);
  const listingData = listingDataProp || fetchedDetails?.listing;
  const { currency: guestCurrency, formatPrice, convertPrice, country, symbol } = useCurrency();

  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const dateObj = {
    checkin: searchParamsObj?.checkin,
    checkout: searchParamsObj?.checkout,
  };

  const formattedDates = useDateFormatting(dateObj);

  const guestNumber = Number(searchParamsObj?.numberOfGuests) || 1;
  const checkin = searchParamsObj?.checkin;
  const checkout = searchParamsObj?.checkout;
  const nightStaying = parseInt(searchParamsObj?.nightStaying, 10) || 1;
  const orderId = Math.round(Math.random() * 10000000000);

  // Parse Selected Cuisine Add-ons from Search Params
  const selectedCuisineAddons = useMemo(() => {
    if (!searchParamsObj?.cuisineAddons) return [];
    try {
      const parsed = JSON.parse(decodeURIComponent(searchParamsObj.cuisineAddons));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [searchParamsObj?.cuisineAddons]);

  const cuisineUSD = useMemo(() => {
    return selectedCuisineAddons.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || guestNumber),
      0
    );
  }, [selectedCuisineAddons, guestNumber]);

  // Standard USD Calculation
  const rawBaseUSD = parseInt(listingData?.basePrice, 10) || 100;
  const totalRoomUSD = rawBaseUSD * nightStaying;
  
  // Apply coupon discount if active
  const discountUSD = appliedCoupon?.discountAmount || 0;
  const discountedRoomUSD = Math.max(0, totalRoomUSD - discountUSD);
  const subtotalWithCuisineUSD = discountedRoomUSD + cuisineUSD;
  const taxesUSD = Math.round((subtotalWithCuisineUSD * 14) / 100);
  const totalStayUSD = subtotalWithCuisineUSD + taxesUSD;

  // Converted in Guest's local currency
  const convertedGuestTotal = convertPrice(totalStayUSD);
  const guestDiscountAmount = convertPrice(discountUSD);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existingScript = document.getElementById("razorpay-checkout-sdk");
      if (existingScript) {
        if (window.Razorpay) {
          resolve(true);
        } else {
          existingScript.addEventListener("load", () => resolve(true), { once: true });
          existingScript.addEventListener("error", () => resolve(false), { once: true });
        }
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-checkout-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();

    try {
      setIsProcessing(true);

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay checkout SDK. Check internet connection.");
        setIsProcessing(false);
        return;
      }

      // Step 1: Create order on backend in Guest's Currency with Coupon & Cuisine Addons
      const orderRes = await api.post("/reservations/create_razorpay_order", {
        amount: convertedGuestTotal,
        currency: guestCurrency,
        listingId: listingData?._id,
        nightStaying,
        guestNumber,
        selectedCuisineAddons,
        couponCode: appliedCoupon?.coupon?.code || null,
      });

      if (!orderRes.data || !orderRes.data.order_id) {
        throw new Error(orderRes.data?.error || "Unable to initiate Razorpay order.");
      }

      const { order_id, amount, currency, keyId } = orderRes.data;

      const userName = currentUser?.name
        ? `${currentUser.name.firstName || ""} ${currentUser.name.lastName || ""}`.trim()
        : "Guest Traveler";
      const userEmail = currentUser?.emailId || "guest@journeycuisine.com";

      // Step 2: Open Razorpay Checkout Modal
      const options = {
        key:
          keyId ||
          import.meta.env.VITE_RAZORPAY_KEY_ID ||
          "rzp_test_TQ65wJo8tIo228",
        amount: amount,
        currency: currency || guestCurrency || "INR",
        name: "Journey Cuisine",
        description: `Booking: ${listingData?.title || "Motel Stay"} (${nightStaying} Night${nightStaying > 1 ? "s" : ""})${selectedCuisineAddons.length > 0 ? ` + ${selectedCuisineAddons.length} Dining Experiences` : ""}`,
        image: "/src/assets/Travel_Logo.png",
        order_id: order_id,
        handler: async function (response) {
          try {
            // Step 3: Verify Payment Signature on Backend
            const verifyRes = await api.post("/reservations/verify_payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              listingId: listingData?._id,
              authorId: listingData?.author,
              guestNumber,
              checkIn: checkin,
              checkOut: checkout,
              nightStaying,
              orderId,
              currency: guestCurrency,
              selectedCuisineAddons,
              couponCode: appliedCoupon?.coupon?.code || null,
            });

            if (verifyRes.data?.success) {
              toast.success("Payment verified! Booking confirmed.");
              navigate(
                `/payment-confirmed?guestNumber=${guestNumber}&checkIn=${checkin}&checkOut=${checkout}&listingId=${listingData?._id}&authorId=${listingData?.author}&nightStaying=${nightStaying}&orderId=${orderId}&razorpayPaymentId=${response.razorpay_payment_id}&razorpayOrderId=${response.razorpay_order_id}&currency=${guestCurrency}&couponCode=${appliedCoupon?.coupon?.code || ""}&couponDiscount=${guestDiscountAmount || 0}`
              );
            } else {
              toast.error(verifyRes.data?.error || "Signature verification failed.");
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            toast.error(
              verifyError.response?.data?.error ||
                "Payment verification error on server."
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: "9999999999",
        },
        notes: {
          listingId: listingData?._id || "",
          orderId: orderId.toString(),
          guestCurrency: guestCurrency,
          couponCode: appliedCoupon?.coupon?.code || "NONE",
        },
        theme: {
          color: "#ff385c",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast("Payment window closed", { icon: "ℹ️" });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        toast.error(
          response.error.description ||
            response.error.reason ||
            "Payment failed. Please try again."
        );
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Razorpay checkout error:", err);
      toast.error(err.response?.data?.error || err.message || "Failed to start payment.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-xl">
      {/* Trip Information Section */}
      <div className="flex flex-col gap-6">
        <h5 className="text-xl md:text-[22px] text-[#222222] dark:text-white font-semibold">
          Your Trip
        </h5>

        <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-neutral-50 dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800">
          <div>
            <p className="text-xs text-[#717171] dark:text-neutral-400 font-medium">Dates</p>
            <p className="text-sm font-semibold text-[#222222] dark:text-white mt-0.5">
              {formattedDates || "Selected Dates"}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              {nightStaying} night{nightStaying > 1 ? "s" : ""}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#717171] dark:text-neutral-400 font-medium">Guests</p>
            <p className="text-sm font-semibold text-[#222222] dark:text-white mt-0.5">
              {guestNumber} {guestNumber === 1 || guestNumber === "1" ? "guest" : "guests"}
            </p>
          </div>
        </div>

        {/* Currency & Promo Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs">
          <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium">
            <FiGlobe size={14} />
            Billing Currency: <strong>{country} ({guestCurrency})</strong>
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {symbol} {convertedGuestTotal.toLocaleString()}
          </span>
        </div>

        {appliedCoupon && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
            <FiTag className="text-emerald-600 dark:text-emerald-400 shrink-0" size={15} />
            <span>
              Promo Code <strong>{appliedCoupon.coupon?.code}</strong> applied! You are saving <strong>{formatPrice(discountUSD)}</strong> on this stay.
            </span>
          </div>
        )}

        {/* Razorpay Standard Checkout Header */}
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xl md:text-[22px] text-[#222222] dark:text-white font-semibold flex items-center gap-2">
              <FiCreditCard className="text-[#ff385c]" size={22} />
              Payment Method
            </h5>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <RazorpayIcon size={13} />
              Razorpay ({guestCurrency})
            </span>
          </div>

          {/* Payment Badges & Supported Methods */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
              <span className="font-semibold flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-500" size={14} />
                Instant Confirmation
              </span>
              <span className="text-gray-500">UPI • Cards • NetBanking • Wallets</span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your order will be processed in <strong>{guestCurrency}</strong> via Razorpay Secure Checkout with 256-bit bank-grade encryption.
            </p>
          </div>
        </div>

        <hr className="w-full h-px bg-neutral-200 dark:bg-neutral-800 my-2" />

        {/* Ground Rules & Policies */}
        <div className="space-y-3">
          <h5 className="text-lg text-[#222222] dark:text-white font-semibold">
            Ground Rules
          </h5>
          <p className="text-xs text-[#717171] dark:text-neutral-400 leading-relaxed">
            We ask every guest to remember a few simple things about what makes a great guest:
          </p>
          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 list-disc pl-5">
            <li>Follow the house rules and check-in/out timings.</li>
            <li>Treat your Host’s motel and home with care and respect.</li>
          </ul>
        </div>

        <hr className="w-full h-px bg-neutral-200 dark:bg-neutral-800 my-2" />

        <p className="text-xs text-[#717171] dark:text-neutral-400 leading-relaxed">
          By selecting the button below, you agree to the Host&apos;s House Rules, Ground Rules for guests, Motel&apos;s Cancellation & Refund Policy, and understand that standard tax deductions apply upon approved cancellations.
        </p>

        {/* Checkout Trigger Button */}
        <form onSubmit={handleRazorpayPayment}>
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] px-8 py-3.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] transition duration-200 text-white font-bold text-sm cursor-pointer shadow-md disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <PulseLoader size={7} color="#ffffff" speedMultiplier={0.6} />
            ) : (
              <>
                <FiLock size={16} />
                Pay {formatPrice(totalStayUSD)} with Razorpay
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <FiShield className="text-emerald-500" size={14} />
          <span>Guaranteed Safe & Secure Checkout Powered by Razorpay Standard</span>
        </div>
      </div>
    </div>
  );
};

export default Payment;
