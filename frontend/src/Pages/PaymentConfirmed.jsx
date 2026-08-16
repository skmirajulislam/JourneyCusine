import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FadeLoader } from "react-spinners";
import { useAuth } from "../hooks/useAuth";
import api from "../backend";
import { toast } from "react-hot-toast";
import { FiCheckCircle, FiCalendar, FiArrowRight, FiPrinter } from "react-icons/fi";

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

const PaymentConfirmed = () => {
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const [searchParams] = useSearchParams();

  const searchParamsObj = useMemo(() => {
    return Object.fromEntries(searchParams);
  }, [searchParams]);

  const paymentId =
    searchParamsObj.razorpayPaymentId ||
    searchParamsObj.razorpay_payment_id ||
    "";
  const orderId = searchParamsObj.orderId || "";

  useEffect(() => {
    const confirmBooking = async () => {
      // If we only have booking parameters without prior verification, save reservation
      if (searchParamsObj.listingId && !paymentId) {
        try {
          await api.post("/reservations/booking", {
            listingId: searchParamsObj.listingId,
            authorId: searchParamsObj.authorId,
            guestNumber: searchParamsObj.guestNumber,
            checkIn: searchParamsObj.checkIn,
            checkOut: searchParamsObj.checkOut,
            nightStaying: searchParamsObj.nightStaying,
            orderId: searchParamsObj.orderId,
            razorpayPaymentId: searchParamsObj.razorpayPaymentId || "",
            razorpayOrderId: searchParamsObj.razorpayOrderId || "",
          });
        } catch (error) {
          console.error("Booking fallback error:", error);
          setPaymentFailed(true);
          toast.error(error.response?.data?.message || "Error finalizing booking.");
        }
      }
      setIsLoading(false);
    };

    confirmBooking();
  }, [searchParamsObj, paymentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-[60dvh]">
        <FadeLoader color="#ff385c" />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <FiCheckCircle size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {paymentFailed
              ? "Payment status pending review"
              : "Reservation Confirmed!"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {paymentFailed
              ? "Your transaction is being verified by our server. Please check your bookings in your profile."
              : "Your motel stay has been successfully booked and secured through Razorpay Standard Checkout."}
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="w-full rounded-2xl bg-neutral-50 dark:bg-[#262626] border border-neutral-200 dark:border-neutral-700/60 p-5 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
              <RazorpayIcon className="text-blue-500" size={13} />
              Payment Gateway
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Razorpay (Verified)
            </span>
          </div>

          {orderId && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Order ID
              </span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                #{orderId}
              </span>
            </div>
          )}

          {paymentId && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Razorpay Payment ID
              </span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {paymentId}
              </span>
            </div>
          )}

          {searchParamsObj.couponCode && (
            <div className="flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Promo Code Applied
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {searchParamsObj.couponCode}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Payment Status
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Paid • Confirmed
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full max-w-md pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full py-3 px-5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FiPrinter size={14} />
            Download / Print PDF Booking Invoice
          </button>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full">
            <Link
              to={currentUser?._id ? `/users/show/${currentUser._id}` : "/user/profile"}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:bg-black dark:hover:bg-gray-100 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <FiCalendar size={14} />
              View in My Bookings
            </Link>

            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              Explore More Stays
              <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentConfirmed;
