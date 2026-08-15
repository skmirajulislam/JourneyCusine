import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiClock, FiXCircle, FiUser } from "react-icons/fi";

const AllReservations = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 px-6 text-center max-w-md mx-auto">
        <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
          No reservations found
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          All your property bookings across all statuses will be shown here.
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
            <th className="px-4 py-3.5">EARNED</th>
            <th className="px-4 py-3.5">STATUS</th>
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

            return (
              <tr
                key={item._id}
                className="hover:bg-neutral-50 dark:hover:bg-[#222222] transition-colors"
              >
                <td className="px-4 py-4 font-mono font-medium text-gray-900 dark:text-white">
                  #{item.orderId || item._id?.slice(-6)}
                </td>

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

                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                    <FiUser className="text-gray-400" size={13} />
                    <span>{item.guest?.name?.firstName || item.guestName || "Guest"}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {item.guestNumber || 1} Guests • {nights} Nights
                  </span>
                </td>

                <td className="px-4 py-4 text-gray-800 dark:text-gray-200">
                  {checkIn} - {checkOut}
                </td>

                <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                  {(() => {
                    const hostCur = item.hostCurrency || "INR";
                    const hostSymbol = hostCur === "INR" ? "₹" : "$";
                    const earned = item.hostEarnings !== undefined ? item.hostEarnings : (item.authorEarnedPrice || Math.round((item.basePrice || 0) * nights * 0.97));
                    const guestCur = item.guestCurrency || item.currency || "USD";
                    return (
                      <div>
                        <span>{hostSymbol}{earned.toLocaleString()} ({hostCur})</span>
                        <p className="text-[10px] font-normal text-gray-400 dark:text-gray-500">
                          Paid by guest in {guestCur}
                        </p>
                      </div>
                    );
                  })()}
                </td>

                <td className="px-4 py-4">
                  {item.status === "confirmed" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      <FiCheckCircle size={11} /> Confirmed
                    </span>
                  )}
                  {item.status === "cancellation_requested" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      <FiClock size={11} /> Cancel Requested
                    </span>
                  )}
                  {item.status === "refunded" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      <FiCheckCircle size={11} /> Refunded
                    </span>
                  )}
                  {item.status === "cancelled" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      <FiXCircle size={11} /> Cancelled
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

AllReservations.propTypes = {
  data: PropTypes.array,
};

export default AllReservations;
