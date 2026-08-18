 
import { useMemo } from "react";
import { reservationListItems } from "./reservationsListName";
import { removeDuplicates } from "../../../hooks/useRemoveDuplicates";
import { useHostData } from "../../../hooks/useHostData";

const ReservationsList = ({ active, setActivePage }) => {
  const { authorReservations = [] } = useHostData();

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
    <section className="mt-4 sm:mt-6 w-full max-w-full">
      <h1 className="text-[#222222] dark:text-white text-2xl sm:text-3xl font-bold tracking-tight">
        Reservations
      </h1>
      <div className="relative w-full max-w-full mt-4 sm:mt-6">
        <div className="flex flex-row gap-1 sm:gap-4 relative z-10 justify-start overflow-x-auto pb-2 scrollbar-none max-w-full">
          {reservationListItems.map((list) => {
            const count = counts[list.id];
            const hasPendingAction =
              list.id === 3 && counts.pendingCancellations > 0;

            return (
              <button
                key={list.id}
                type="button"
                onClick={() => handleActive(list.id)}
                className={`flex items-center gap-1.5 pb-2.5 px-2.5 sm:px-3.5 cursor-pointer text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 shrink-0 ${
                  active === list.id
                    ? "border-[#ff385c] text-[#ff385c] font-bold"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>{list.name}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      hasPendingAction
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 animate-pulse"
                        : active === list.id
                        ? "bg-[#ff385c] text-white"
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
        <hr className="absolute bottom-0 w-full h-[1px] bg-gray-200 dark:bg-[#2d2d2d] z-0" />
      </div>
    </section>
  );
};

export default ReservationsList;
