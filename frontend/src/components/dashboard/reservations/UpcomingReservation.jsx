import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FiUser, FiCalendar } from "react-icons/fi";
import { getCurrencySymbol } from "../../../utils/currency";

const UpcomingReservation = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 px-6 text-center max-w-md mx-auto">
        <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
          No upcoming reservations
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          When guests book your motel stays, their upcoming trips will appear here.
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
            <th className="px-4 py-3.5">CHECK IN</th>
            <th className="px-4 py-3.5">CHECK OUT</th>
            <th className="px-4 py-3.5">EARNED</th>
            <th className="px-4 py-3.5">ACTION</th>
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
                  <span className="flex items-center gap-1 font-medium">
                    <FiCalendar size={12} className="text-[#ff385c]" />
                    {checkIn}
                  </span>
                </td>

                <td className="px-4 py-4 text-gray-800 dark:text-gray-200">
                  <span className="flex items-center gap-1 font-medium">
                    <FiCalendar size={12} className="text-[#ff385c]" />
                    {checkOut}
                  </span>
                </td>

                <td className="px-4 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  {getCurrencySymbol(item.hostCurrency || item.currency || "INR")}{Number(item.hostEarnings !== undefined ? item.hostEarnings : (item.authorEarnedPrice || Math.round((item.basePrice || 0) * nights * 0.97))).toLocaleString()}
                </td>

                <td className="px-4 py-4">
                  <Link
                    to={`/rooms/${item.listingId}`}
                    className="inline-block px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    View stay
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

UpcomingReservation.propTypes = {
  data: PropTypes.array,
};

export default UpcomingReservation;
