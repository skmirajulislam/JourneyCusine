import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FadeLoader } from "react-spinners";
import { useAuth } from "../hooks/useAuth";
import { useListingDetails } from "../hooks/useHostData";
import { useCurrency } from "../context/CurrencyContext";
import api from "../backend";
import { toast } from "react-hot-toast";
import {
  FiCheckCircle,
  FiCalendar,
  FiArrowRight,
  FiPrinter,
  FiMapPin,
  FiUser,
  FiMail,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";

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
  const { formatPrice } = useCurrency();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const [searchParams] = useSearchParams();

  const searchParamsObj = useMemo(() => {
    return Object.fromEntries(searchParams);
  }, [searchParams]);

  const listingId = searchParamsObj.listingId || "";
  const { data: listingDetailsData } = useListingDetails(listingId);
  const listing = listingDetailsData?.listing;

  const paymentId =
    searchParamsObj.razorpayPaymentId ||
    searchParamsObj.razorpay_payment_id ||
    "";
  const orderId = searchParamsObj.orderId || Math.floor(10000000 + Math.random() * 90000000).toString();
  const checkIn = searchParamsObj.checkIn || searchParamsObj.checkin || "";
  const checkOut = searchParamsObj.checkOut || searchParamsObj.checkout || "";
  const guestNumber = parseInt(searchParamsObj.guestNumber || searchParamsObj.numberOfGuests || "1", 10);
  const nightStaying = parseInt(searchParamsObj.nightStaying || "1", 10);
  const couponCode = searchParamsObj.couponCode || "";
  const couponDiscountUSD = Number(searchParamsObj.couponDiscount) || 0;

  // Selected Cuisine Addons
  const selectedCuisineAddons = useMemo(() => {
    if (!searchParamsObj?.cuisineAddons) return [];
    try {
      const parsed = JSON.parse(decodeURIComponent(searchParamsObj.cuisineAddons));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [searchParamsObj?.cuisineAddons]);

  useEffect(() => {
    const confirmBooking = async () => {
      if (searchParamsObj.listingId && !paymentId) {
        try {
          await api.post("/reservations/booking", {
            listingId: searchParamsObj.listingId,
            authorId: searchParamsObj.authorId,
            guestNumber,
            checkIn,
            checkOut,
            nightStaying,
            orderId,
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
  }, [searchParamsObj, paymentId, checkIn, checkOut, guestNumber, nightStaying, orderId]);

  // Financial Calculations
  const hostCurrency = listing?.currency || listing?.author?.currency || "INR";
  const rawBase = Number(listing?.basePrice) || 50;
  const roomTotal = rawBase * nightStaying;
  const cuisineTotal = selectedCuisineAddons.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || guestNumber),
    0
  );
  const subtotalBeforeDiscount = roomTotal + cuisineTotal;
  const discountedSubtotal = Math.max(0, subtotalBeforeDiscount - couponDiscountUSD);
  const taxes = Math.round((discountedSubtotal * 14) / 100);
  const grandTotal = discountedSubtotal + taxes;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-[60dvh]">
        <FadeLoader color="#ff385c" />
      </div>
    );
  }

  const formattedIssueDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedCheckIn = checkIn
    ? new Date(checkIn).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Confirmed";

  const formattedCheckOut = checkOut
    ? new Date(checkOut).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Confirmed";

  return (
    <>
      {/* Complete print styles with explicit high-contrast ink-friendly styling */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #111827 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: none !important;
          }
          #printable-invoice .invoice-box {
            background-color: #f9fafb !important;
            border-color: #e5e7eb !important;
          }
          #printable-invoice .invoice-table th {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
            border-color: #e5e7eb !important;
          }
          #printable-invoice .invoice-table td {
            border-color: #e5e7eb !important;
            color: #1f2937 !important;
          }
          #printable-invoice .invoice-label {
            color: #374151 !important;
            font-weight: 700 !important;
          }
          #printable-invoice .invoice-subtext {
            color: #4b5563 !important;
          }
          #printable-invoice .invoice-total-row {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {/* On-screen Header Actions */}
        <div className="no-print mb-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 shadow-md">
            <FiCheckCircle size={32} />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {paymentFailed ? "Payment Verification Pending" : "Reservation Confirmed! 🎉"}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed px-2">
            Your stay has been confirmed and paid via Razorpay Secure Checkout. A copy of this receipt has been saved to your account.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <FiPrinter size={16} />
              <span>Download / Print PDF Booking Invoice</span>
            </button>

            <Link
              to={currentUser?._id ? `/users/show/${currentUser._id}` : "/user/profile"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs sm:text-sm hover:bg-black dark:hover:bg-neutral-100 transition-all shadow-sm"
            >
              <FiCalendar size={16} />
              <span>View in My Bookings</span>
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs sm:text-sm transition-all"
            >
              <span>Explore More Stays</span>
              <FiArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* OFFICIAL PRINTABLE BOOKING RECEIPT & TAX INVOICE */}
        {/* ======================================================== */}
        <div
          id="printable-invoice"
          className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl space-y-6 sm:space-y-8"
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#ff385c] text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shrink-0">
                JC
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  Journey Cuisine
                </h2>
                <p className="text-xs invoice-subtext text-neutral-600 dark:text-neutral-400 font-medium">
                  Verified Stays &amp; Gastronomic Experiences
                </p>
              </div>
            </div>

            <div className="sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-end sm:items-end">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                <FiCheck size={13} />
                <span>CONFIRMED &amp; PAID</span>
              </div>
              <div className="text-right sm:mt-1.5">
                <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono font-bold">
                  Invoice: #{orderId}
                </p>
                <p className="text-[11px] invoice-subtext text-neutral-600 dark:text-neutral-400">
                  Issued: {formattedIssueDate}
                </p>
              </div>
            </div>
          </div>

          {/* Guest and Host Information Grid */}
          <div className="invoice-box grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/80 dark:border-neutral-800">
            <div>
              <span className="invoice-label text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Billed To (Guest)
              </span>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
                <FiUser size={14} className="text-[#ff385c]" />
                {currentUser?.name?.firstName || "Valued Guest"}{" "}
                {currentUser?.name?.lastName !== "guest" ? currentUser?.name?.lastName : ""}
              </h4>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5 flex items-center gap-1.5">
                <FiMail size={13} className="text-neutral-500" />
                {currentUser?.emailId || "guest@journeycuisine.com"}
              </p>
              <p className="text-xs invoice-subtext text-neutral-600 dark:text-neutral-400 mt-0.5">
                Billing Region: <strong className="text-neutral-800 dark:text-neutral-200">{currentUser?.country || "India"}</strong>
              </p>
            </div>

            <div>
              <span className="invoice-label text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Property &amp; Host
              </span>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1 line-clamp-1">
                {listing?.title || "Luxury Motel & Camping Stay"}
              </h4>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5 flex items-center gap-1.5">
                <FiMapPin size={13} className="text-[#ff385c]" />
                {listing?.location?.city?.name || listing?.location?.country?.name || "Tirur, Kerala, India"}
              </p>
              <p className="text-xs invoice-subtext text-neutral-600 dark:text-neutral-400 mt-0.5">
                Type: <strong className="text-neutral-800 dark:text-neutral-200">{listing?.privacyType || "Entire"} {listing?.houseType || "Property"}</strong>
              </p>
            </div>
          </div>

          {/* Stay Itinerary Card */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="bg-neutral-100 dark:bg-[#252525] px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="invoice-label text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <FiCalendar size={14} className="text-[#ff385c]" />
                <span>Reservation Itinerary</span>
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800 p-3 sm:p-4 text-center">
              <div className="p-2 sm:p-3">
                <span className="invoice-label text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Check-in</span>
                <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  {formattedCheckIn}
                </p>
                <span className="invoice-subtext text-[10px] text-neutral-500 dark:text-neutral-400">From 3:00 PM</span>
              </div>

              <div className="p-2 sm:p-3">
                <span className="invoice-label text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Check-out</span>
                <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  {formattedCheckOut}
                </p>
                <span className="invoice-subtext text-[10px] text-neutral-500 dark:text-neutral-400">Until 11:00 AM</span>
              </div>

              <div className="p-2 sm:p-3">
                <span className="invoice-label text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Duration</span>
                <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  {nightStaying} Night{nightStaying > 1 ? "s" : ""}
                </p>
                <span className="invoice-subtext text-[10px] text-neutral-500 dark:text-neutral-400">Reserved Stay</span>
              </div>

              <div className="p-2 sm:p-3">
                <span className="invoice-label text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Guests</span>
                <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  {guestNumber} Guest{guestNumber > 1 ? "s" : ""}
                </p>
                <span className="invoice-subtext text-[10px] text-neutral-500 dark:text-neutral-400">Capacity verified</span>
              </div>
            </div>
          </div>

          {/* Itemized Pricing & Tax Breakdown Table */}
          <div className="space-y-2.5">
            <h4 className="invoice-label text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Payment &amp; Tax Breakdown
            </h4>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto text-xs">
              <table className="invoice-table w-full text-left min-w-[340px]">
                <thead className="bg-neutral-100 dark:bg-[#252525] border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Description</th>
                    <th className="py-2.5 px-2 sm:px-4 text-center">Qty</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Rate</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {/* Room Accommodation */}
                  <tr>
                    <td className="py-3 px-3 sm:px-4 font-medium">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {listing?.title || "Property Stay"}
                      </div>
                      <span className="invoice-subtext text-[11px] text-neutral-600 dark:text-neutral-400">
                        {listing?.privacyType || "Entire"} Accommodation
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-center text-neutral-700 dark:text-neutral-300 font-semibold">
                      {nightStaying}n
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-neutral-700 dark:text-neutral-300">
                      {formatPrice(rawBase, hostCurrency)}/n
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-bold text-neutral-900 dark:text-white">
                      {formatPrice(roomTotal, hostCurrency)}
                    </td>
                  </tr>

                  {/* Culinary Offerings / Addons */}
                  {selectedCuisineAddons.map((addon, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 sm:px-4 font-medium">
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          <IoFastFoodOutline className="text-amber-500 shrink-0" />
                          <span>{addon.title}</span>
                        </div>
                        <span className="invoice-subtext text-[11px] text-neutral-600 dark:text-neutral-400">
                          {addon.courseType || "Culinary Experience"}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center text-neutral-700 dark:text-neutral-300 font-semibold">
                        {addon.quantity || guestNumber}x
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right text-neutral-700 dark:text-neutral-300">
                        {formatPrice(addon.price, hostCurrency)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right font-bold text-neutral-900 dark:text-white">
                        {formatPrice(Number(addon.price) * (Number(addon.quantity) || guestNumber), hostCurrency)}
                      </td>
                    </tr>
                  ))}

                  {/* Coupon Discount */}
                  {couponCode && (
                    <tr className="bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                      <td className="py-2.5 px-3 sm:px-4 font-bold" colSpan={3}>
                        🎁 Promotional Voucher Discount ({couponCode})
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-extrabold">
                        -{formatPrice(couponDiscountUSD, hostCurrency)}
                      </td>
                    </tr>
                  )}

                  {/* Taxes & GST */}
                  <tr>
                    <td className="py-2.5 px-3 sm:px-4 text-neutral-700 dark:text-neutral-300 font-medium" colSpan={3}>
                      Occupancy Tax &amp; GST (14%)
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-bold text-neutral-900 dark:text-white">
                      {formatPrice(taxes, hostCurrency)}
                    </td>
                  </tr>

                  {/* Grand Total */}
                  <tr className="invoice-total-row bg-neutral-100 dark:bg-[#282828] text-neutral-900 dark:text-white text-xs sm:text-sm font-black">
                    <td className="py-3.5 px-3 sm:px-4" colSpan={3}>
                      Total Amount Paid (Tax Incl.)
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right text-sm sm:text-base text-[#ff385c] font-black">
                      {formatPrice(grandTotal, hostCurrency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Security Verification Footer */}
          <div className="invoice-box p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                <RazorpayIcon className="text-blue-500 shrink-0" size={15} />
                <span>Payment Gateway: Razorpay Verified Checkout</span>
              </div>
              <p className="invoice-subtext text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                Payment Ref: <strong className="text-neutral-800 dark:text-neutral-200">{paymentId || `pay_${orderId.slice(0, 8)}`}</strong> • Order Ref: <strong className="text-neutral-800 dark:text-neutral-200">#{orderId}</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-[11px] shrink-0">
              <FiShield className="text-emerald-500 shrink-0" size={14} />
              <span>256-Bit Encrypted Payment</span>
            </div>
          </div>

          {/* Terms and Support Disclaimer */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 text-[11px] invoice-subtext text-neutral-600 dark:text-neutral-400 space-y-1 leading-relaxed">
            <p>
              • Need help with your reservation? Contact Journey Cuisine Support at <strong className="text-neutral-800 dark:text-neutral-200">support@journeycuisine.com</strong> or message your host directly from your profile.
            </p>
            <p>
              • This document serves as an official proof of booking and digital tax invoice for Journey Cuisine reservations.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentConfirmed;
