import { useDispatch, useSelector } from "react-redux";
import Charts from "../../components/dashboard/Charts";
import DashboardCards from "../../components/dashboard/DashboardCards";
import { useEffect, useState } from "react";
import { getAuthorReservations } from "../../redux/actions/reservationsActions";
import { removeDuplicates } from "../../hooks/useRemoveDuplicates";

const Overview = () => {
  const listingReservations = useSelector(
    (state) => state.reservations.authorReservations
  );
  const [reservations, setReservations] = useState([]);

  const dispatch = useDispatch();

  // set reservation to the global store
  useEffect(() => {
    dispatch(getAuthorReservations());
  }, []);

  // remove duplicates and set reservation to state
  useEffect(() => {
    setReservations(
      removeDuplicates(listingReservations, "checkIn", "checkOut")
    );
  }, [listingReservations]);

  // calculate total price of the reservations
  const totalPrice = reservations?.reduce((accumulator, reservation) => {
    return accumulator + reservation.authorEarnedPrice;
  }, 0);

  return (
    <section className=" max-w-[1200px] mx-auto px-4 sm:px-8 md:px-10 xl:px-20 py-8 md:py-12">
      <DashboardCards reservations={reservations} totalPrice={totalPrice} />

      <div className=" grid">
        <div className="bg-white shadow rounded-xl border flex flex-col gap-5 p-7 min-h-[350px]">
          <p className=" text-zinc-800 text-base font-semibold">
            Overview of earnings
          </p>
          <>
            {/* dynamic data for charts */}
            <Charts reservations={reservations} />
          </>
        </div>
      </div>
    </section>
  );
};

export default Overview;
