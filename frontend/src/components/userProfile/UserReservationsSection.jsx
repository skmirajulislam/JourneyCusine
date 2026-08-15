import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../backend";
import { toast } from "react-hot-toast";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiDollarSign,
  FiMapPin,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import { FadeLoader } from "react-spinners";
import { CURRENCY_SYMBOLS } from "../../utils/currency";

const UserReservationsSection = () => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingRes, setCancellingRes] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/reservations/my_bookings");
      if (Array.isArray(res.data)) {
        setReservations(res.data);
      }
    } catch (error) {
      console.error("Fetch reservations error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleRequestCancellation = async (e) => {
    e.preventDefault();
    if (!cancellingRes) return;

    try {
      setIsSubmittingCancel(true);
      const res = await api.post(
        `/reservations/request_cancellation/${cancellingRes._id}`,
        { reason: cancelReason }
      );

      toast.success(res.data?.message || "Cancellation request sent to host!");
      setCancellingRes(null);
      setCancelReason("");
      fetchReservations();
    } catch (error) {
      console.error("Cancellation request error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit cancellation request."
      );
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12 pt-8 border-t border-[#dddddd] dark:border-[#333333] flex justify-center items-center py-10">
        <FadeLoader color="#ff385c" height={10} width={3} />
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-[#dddddd] dark:border-[#333333] w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#222222] dark:text-white flex items-center gap-2.5">
            My Bookings &amp; Stays
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#ff385c]">
              {reservations.length} {reservations.length === 1 ? "stay" : "stays"}
            </span>
          </h2>
          <p className="text-sm text-[#717171] dark:text-[#a0a0a0] mt-1">
            Track your hotel reservations, stay timings, payment status, and manage cancellations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReservations}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-[#ff385c] dark:hover:text-[#ff385c] transition-colors self-start sm:self-auto"
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-[#dddddd] dark:border-[#333333] bg-[#fafafa] dark:bg-[#1a1a1a] text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#ff385c] flex items-center justify-center">
            <FiCalendar size={22} />
          </div>
          <h3 className="text-base font-semibold text-[#222222] dark:text-white">
            No reservations yet
          </h3>
          <p className="text-xs text-[#717171] dark:text-[#a0a0a0] mt-1 max-w-sm mx-auto">
            You have not booked any stays yet. Explore our unique motels and destinations to plan your next journey.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#e0314f] text-white text-xs font-semibold transition-all shadow-sm"
          >
            Explore stays
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reservations.map((resItem) => {
            const checkInFormatted = resItem.checkIn
              ? new Date(resItem.checkIn).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A";

            const checkOutFormatted = resItem.checkOut
              ? new Date(resItem.checkOut).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A";

            const bookedDateFormatted = resItem.created_at
              ? new Date(resItem.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recently";

            const previewImg =
              resItem.listing?.photos?.[0] ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";

            const locationStr = [
              resItem.listing?.location?.city?.name || resItem.listing?.location?.city || "",
              resItem.listing?.location?.country?.name || resItem.listing?.location?.country || "",
            ]
              .filter(Boolean)
              .join(", ");

            const nights = resItem.nightStaying || 1;
            const roomTotal = (resItem.basePrice || 0) * nights;
            const taxes = resItem.taxes || Math.round((roomTotal * 14) / 100);
            const totalPaid = resItem.totalPrice || roomTotal + taxes;

            return (
              <div
                key={resItem._id}
                className="rounded-2xl border border-[#e5e7eb] dark:border-[#333333] bg-white dark:bg-[#1e1e1e] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 items-start justify-between"
              >
                {/* Stay thumbnail & info */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full lg:w-auto flex-1">
                  <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 relative">
                    <img
                      src={previewImg}
                      alt={resItem.listing?.title || "Stay photo"}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[11px] font-medium text-white">
                      Order #{resItem.orderId}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 capitalize">
                          {resItem.listing?.houseType || "Motel Stay"}
                        </span>
                        {locationStr && (
                          <span className="text-xs text-[#717171] dark:text-[#a0a0a0] flex items-center gap-1 truncate">
                            <FiMapPin size={11} /> {locationStr}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-[#222222] dark:text-white line-clamp-1 hover:text-[#ff385c] transition-colors">
                        <Link to={`/rooms/${resItem.listingId}`}>
                          {resItem.listing?.title || "Journey Cuisine Stay"}
                        </Link>
                      </h3>
                    </div>

                    {/* Schedule & Timing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-[#484848] dark:text-[#c0c0c0]">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="text-[#ff385c] shrink-0" size={14} />
                        <span>
                          <strong className="font-semibold text-gray-800 dark:text-gray-200">
                            Check-in:
                          </strong>{" "}
                          {checkInFormatted}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="text-[#ff385c] shrink-0" size={14} />
                        <span>
                          <strong className="font-semibold text-gray-800 dark:text-gray-200">
                            Check-out:
                          </strong>{" "}
                          {checkOutFormatted}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <FiClock className="text-neutral-500 shrink-0" size={14} />
                        <span>Check-in after 2:00 PM • Out by 11:00 AM</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <FiUser className="text-neutral-500 shrink-0" size={14} />
                        <span>
                          {resItem.guestNumber || 1}{" "}
                          {resItem.guestNumber === 1 ? "Guest" : "Guests"} • {nights}{" "}
                          {nights === 1 ? "Night" : "Nights"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Status Column */}
                <div className="w-full lg:w-72 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#e5e7eb] dark:border-[#333333] pt-4 lg:pt-0 lg:pl-6 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Payment Summary
                      </span>
                      {resItem.status === "confirmed" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          <FiCheckCircle size={11} /> Paid
                        </span>
                      )}
                      {resItem.status === "cancellation_requested" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                          <FiAlertCircle size={11} /> Cancellation In Review
                        </span>
                      )}
                      {resItem.status === "refunded" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          <FiCheckCircle size={11} /> Refund Successful
                        </span>
                      )}
                      {resItem.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          <FiXCircle size={11} /> Cancelled
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                      {(() => {
                        const resCurrency = resItem.guestCurrency || resItem.currency || "INR";
                        const resSymbol = CURRENCY_SYMBOLS[resCurrency] || "$";
                        const displayBase = resItem.guestBasePrice !== undefined ? resItem.guestBasePrice : roomTotal;
                        const displayTax = resItem.guestTaxes !== undefined ? resItem.guestTaxes : taxes;
                        const displayTotal = resItem.guestTotalPaid !== undefined ? resItem.guestTotalPaid : totalPaid;
                        const displayRefund = resItem.refundDetails?.refundAmount !== undefined ? resItem.refundDetails.refundAmount : displayBase;
                        const displayTaxRetained = resItem.refundDetails?.taxDeduction !== undefined ? resItem.refundDetails.taxDeduction : displayTax;

                        return (
                          <>
                            <div className="flex justify-between">
                              <span>
                                {resSymbol}{Math.round(displayBase / nights)} × {nights} nights
                              </span>
                              <span>{resSymbol}{displayBase.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxes (14%)</span>
                              <span>{resSymbol}{displayTax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
                              <span>Total Paid ({resCurrency})</span>
                              <span className="text-[#ff385c]">{resSymbol}{displayTotal.toLocaleString()}</span>
                            </div>

                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                              <FiCreditCard size={12} /> Booked on {bookedDateFormatted}
                            </p>

                            {/* Refund details card if refunded */}
                            {resItem.status === "refunded" && (
                              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs mt-2">
                                <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                  <FiDollarSign size={13} /> Refund Completed
                                </p>
                                <p className="text-emerald-700 dark:text-emerald-400 mt-0.5 text-[11px]">
                                  <strong>{resSymbol}{displayRefund.toLocaleString()}</strong> credited back to your payment method ({resSymbol}{displayTaxRetained.toLocaleString()} tax retained).
                                </p>
                              </div>
                            )}

                            {/* Cancellation Action Buttons */}
                            {resItem.status === "confirmed" && (
                              <button
                                type="button"
                                onClick={() => setCancellingRes(resItem)}
                                className="w-full py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 mt-2"
                              >
                                Request Cancellation
                              </button>
                            )}

                            {resItem.status === "cancellation_requested" && (
                              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 mt-2">
                                Host is reviewing your cancellation. You will be refunded {resSymbol}{displayBase.toLocaleString()} upon approval.
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Request Modal */}
      {cancellingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e1e1e] border border-[#dddddd] dark:border-[#444444] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiAlertCircle className="text-[#ff385c]" size={20} />
                Cancel Reservation
              </h3>
              <button
                type="button"
                onClick={() => setCancellingRes(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRequestCancellation} className="mt-4 flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-[#2a2a2a] text-xs text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  {cancellingRes.listing?.title || "Stay Reservation"}
                </p>
                <p>
                  <strong>Order ID:</strong> #{cancellingRes.orderId}
                </p>
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  <strong>Refund Policy:</strong> Upon host approval, the room charge (
                  ${(cancellingRes.basePrice || 0) * (cancellingRes.nightStaying || 1)}) will be refunded to your original payment gateway. Taxes (
                  ${cancellingRes.taxes || 0}) are non-refundable.
                </p>
              </div>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                Reason for Cancellation (Optional)
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Change of travel plans, emergency..."
                  className="rounded-xl border border-gray-300 dark:border-gray-700 p-3 text-xs dark:bg-[#2a2a2a] dark:text-white focus:border-[#ff385c] focus:outline-none min-h-20"
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingRes(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  disabled={isSubmittingCancel}
                >
                  Keep reservation
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#e0314f] text-xs font-semibold text-white transition shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmittingCancel ? "Submitting..." : "Confirm cancellation request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReservationsSection;
