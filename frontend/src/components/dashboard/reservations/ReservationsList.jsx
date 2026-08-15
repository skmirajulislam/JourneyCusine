/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { reservationListItems } from "./reservationsListName";
import { removeDuplicates } from "../../../hooks/useRemoveDuplicates";

const ReservationsList = ({ active, setActivePage }) => {
  const authorReservations = useSelector(
    (state) => state.reservations?.authorReservations || []
  );

  const uniqueReservations = useMemo(() => {
    return removeDuplicates(authorReservations, "_id");
  }, [authorReservations]);

  const counts = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const upcoming = uniqueReservations.filter((r) => {
      if (
        r.status === "cancellation_requested" ||
        r.status === "cancelled" ||
        r.status === "refunded"
      ) {
        return false;
      }
      const outDate = new Date(r.checkOut || r.checkIn || Date.now());
      outDate.setHours(23, 59, 59, 999);
      return outDate >= todayStart;
    }).length;

    const completed = uniqueReservations.filter((r) => {
      if (
        r.status === "cancellation_requested" ||
        r.status === "cancelled" ||
        r.status === "refunded"
      ) {
        return false;
      }
      const outDate = new Date(r.checkOut || r.checkIn || Date.now());
      outDate.setHours(23, 59, 59, 999);
      return outDate < todayStart;
    }).length;

    const cancellations = uniqueReservations.filter(
      (r) =>
        r.status === "cancellation_requested" ||
        r.status === "refunded" ||
        r.status === "cancelled"
    ).length;

    const pendingCancellations = uniqueReservations.filter(
      (r) => r.status === "cancellation_requested"
    ).length;

    return {
      1: upcoming,
      2: completed,
      3: cancellations,
      4: uniqueReservations.length,
      pendingCancellations,
    };
  }, [uniqueReservations]);

  const handleActive = (id) => {
    sessionStorage.setItem("reservationsPage", JSON.stringify(id));
    setActivePage(id);
  };

  return (
    <section className="mt-6">
      <h1 className="text-[#222222] dark:text-white text-3xl font-semibold">
        Reservations
      </h1>
      <div className="relative">
        <div className="pt-8 flex flex-row gap-2 sm:gap-6 relative z-10 justify-between sm:justify-start overflow-x-auto pb-1">
          {reservationListItems.map((list) => {
            const count = counts[list.id];
            const hasPendingAction =
              list.id === 3 && counts.pendingCancellations > 0;

            return (
              <button
                key={list.id}
                type="button"
                onClick={() => handleActive(list.id)}
                className={`flex items-center gap-2 pb-3 px-3 cursor-pointer text-sm sm:text-base font-medium whitespace-nowrap transition-all border-b-2 ${
                  active === list.id
                    ? "border-[#222222] dark:border-white text-[#222222] dark:text-white font-bold"
                    : "border-transparent text-[#717171] dark:text-[#a0a0a0] hover:text-[#222222] dark:hover:text-white"
                }`}
              >
                <span>{list.name}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      hasPendingAction
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 animate-pulse"
                        : active === list.id
                        ? "bg-[#222222] dark:bg-white text-white dark:text-[#222222]"
                        : "bg-neutral-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <hr className="absolute bottom-0 w-full h-[1px] bg-[#dddddd] dark:bg-[#333333] z-0" />
      </div>
    </section>
  );
};

export default ReservationsList;
