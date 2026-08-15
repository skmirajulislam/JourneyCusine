import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import api from "../../../backend";
import { toast } from "react-hot-toast";
import {
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
} from "react-icons/fi";

const CancelledReservations = ({ data = [], onRefresh }) => {
  const [selectedRes, setSelectedRes] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessRefund = async () => {
    if (!selectedRes) return;
    try {
      setIsProcessing(true);
      const res = await api.post(`/reservations/process_refund/${selectedRes._id}`);
      toast.success(res.data?.message || "Refund processed successfully!");
      setSelectedRes(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Refund processing error:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to process refund."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="py-12 px-6 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-[#2a2a2a] text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <FiAlertCircle size={22} />
        </div>
        <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
          No cancellation requests or refunds
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          When guests request to cancel a stay, their request and refund workflow will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-w-[750px] overflow-x-auto">
      <table className="min-w-full text-left text-xs font-normal border-collapse">
        <thead className="text-xs text-[#717171] dark:text-[#a0a0a0] font-semibold border-b border-[#dddddd] dark:border-[#333333]">
          <tr>
            <th className="px-4 py-3.5">ORDER ID</th>
            <th className="px-4 py-3.5">LISTING</th>
            <th className="px-4 py-3.5">GUEST</th>
            <th className="px-4 py-3.5">STAY DATES</th>
            <th className="px-4 py-3.5">TOTAL PAID</th>
            <th className="px-4 py-3.5">STATUS</th>
            <th className="px-4 py-3.5 text-right">ACTION / DETAILS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eeeeee] dark:divide-[#2a2a2a]">
          {data.map((item) => {
            const checkIn = item.checkIn
              ? new Date(item.checkIn).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A";
            const checkOut = item.checkOut
              ? new Date(item.checkOut).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A";

            const nights = item.nightStaying || 1;
            const roomTotal = (item.basePrice || 0) * nights;
            const tax = item.taxes || Math.round((roomTotal * 14) / 100);
            const totalPaid = item.totalPrice || roomTotal + tax;

            return (
              <tr
                key={item._id}
                className="hover:bg-neutral-50 dark:hover:bg-[#222222] transition-colors"
              >
                {/* Order ID */}
                <td className="px-4 py-4 font-mono font-medium text-gray-900 dark:text-white">
                  #{item.orderId || item._id?.slice(-6)}
                </td>

                {/* Listing Title */}
                <td className="px-4 py-4 max-w-[180px]">
                  <Link
                    to={`/rooms/${item.listingId}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-[#ff385c] transition line-clamp-1"
                  >
                    {item.listing?.title || "Motel Stay"}
                  </Link>
                  <span className="text-[11px] text-gray-500 capitalize">
                    {item.listing?.houseType || "Property"}
                  </span>
                </td>

                {/* Guest */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                    <FiUser className="text-gray-400" size={13} />
                    <span>{item.guest?.name?.firstName || item.guestName || "Guest"}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {item.guestNumber || 1} Guests • {nights} Nights
                  </span>
                </td>

                {/* Dates */}
                <td className="px-4 py-4">
                  <div className="text-gray-800 dark:text-gray-200">
                    {checkIn} - {checkOut}
                  </div>
                </td>

                {/* Total Paid */}
                <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                  ${totalPaid}
                  <span className="block text-[10px] text-gray-400 font-normal">
                    (Tax: ${tax})
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  {item.status === "cancellation_requested" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      <FiClock size={11} /> Cancel Requested
                    </span>
                  )}
                  {item.status === "refunded" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      <FiCheckCircle size={11} /> Refunded (${item.refundDetails?.refundAmount || roomTotal})
                    </span>
                  )}
                  {item.status === "cancelled" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      <FiXCircle size={11} /> Cancelled
                    </span>
                  )}
                </td>

                {/* Action button */}
                <td className="px-4 py-4 text-right">
                  {item.status === "cancellation_requested" ? (
                    <button
                      type="button"
                      onClick={() => setSelectedRes(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#ff385c] hover:bg-[#e0314f] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Process Refund
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {item.refundDetails?.refundedAt
                        ? `Refunded ${new Date(item.refundDetails.refundedAt).toLocaleDateString()}`
                        : "Completed"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Process Refund Modal */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiDollarSign className="text-emerald-500" size={20} />
                Process Guest Refund
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRes(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#2a2a2a] text-xs text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  {selectedRes.listing?.title || "Motel Stay"}
                </p>
                <p>
                  <strong>Guest:</strong> {selectedRes.guest?.name?.firstName || selectedRes.guestName || "Guest"}
                </p>
                <p>
                  <strong>Order ID:</strong> #{selectedRes.orderId}
                </p>
                {selectedRes.cancellationReason && (
                  <p className="mt-2 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                    <strong>Guest Reason:</strong> {selectedRes.cancellationReason}
                  </p>
                )}
              </div>

              {/* Refund Breakdown */}
              {(() => {
                const gCur = selectedRes.guestCurrency || selectedRes.currency || "INR";
                const gSymbol = gCur === "INR" ? "₹" : (gCur === "EUR" ? "€" : (gCur === "GBP" ? "£" : "$"));
                const guestTotal = selectedRes.guestTotalPaid || selectedRes.totalPrice || ((selectedRes.basePrice || 0) * (selectedRes.nightStaying || 1) + (selectedRes.taxes || 0));
                const guestTaxes = selectedRes.guestTaxes || selectedRes.taxes || Math.round(((selectedRes.basePrice || 0) * (selectedRes.nightStaying || 1) * 14) / 100);
                const guestNetRefund = selectedRes.guestBasePrice || (guestTotal - guestTaxes);

                return (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-xs space-y-2">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Total Guest Paid ({gCur})</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {gSymbol}{guestTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>Non-refundable Tax Retained (14%)</span>
                      <span>
                        - {gSymbol}{guestTaxes.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Net Refund to Guest via Razorpay ({gCur})</span>
                      <span>
                        {gSymbol}{guestNetRefund.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRes(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  disabled={isProcessing}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleProcessRefund}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition shadow-sm disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessing ? "Processing Razorpay Refund..." : "Approve & Issue Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CancelledReservations.propTypes = {
  data: PropTypes.array,
  onRefresh: PropTypes.func,
};

export default CancelledReservations;
