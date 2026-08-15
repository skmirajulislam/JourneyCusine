import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import AllReservations from "./AllReservations";
import CancelledReservations from "./CancelledReservations";
import CompletedReservations from "./CompletedReservations";
import UpcomingReservation from "./UpcomingReservation";
import HostCouponsManager from "../coupons/HostCouponsManager";
import { useEffect, useMemo } from "react";
import { removeDuplicates } from "../../../hooks/useRemoveDuplicates";
import { getAuthorReservations } from "../../../redux/actions/reservationsActions";

const ReservationsData = ({ active }) => {
  const authorReservations = useSelector(
    (state) => state.reservations.authorReservations || []
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAuthorReservations());
  }, [dispatch]);

  const uniqueReservations = useMemo(() => {
    return removeDuplicates(authorReservations, "_id");
  }, [authorReservations]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingReservations = useMemo(() => {
    return uniqueReservations.filter((r) => {
      // Exclude cancellations from Upcoming
      if (
        r.status === "cancellation_requested" ||
        r.status === "refunded" ||
        r.status === "cancelled"
      ) {
        return false;
      }
      const outDate = new Date(r.checkOut || r.checkIn || Date.now());
      outDate.setHours(23, 59, 59, 999);
      return outDate >= todayStart;
    });
  }, [uniqueReservations, todayStart]);

  const completedReservations = useMemo(() => {
    return uniqueReservations.filter((r) => {
      if (
        r.status === "cancellation_requested" ||
        r.status === "refunded" ||
        r.status === "cancelled"
      ) {
        return false;
      }
      const outDate = new Date(r.checkOut || r.checkIn || Date.now());
      outDate.setHours(23, 59, 59, 999);
      return outDate < todayStart;
    });
  }, [uniqueReservations, todayStart]);

  const cancelledAndRefundReservations = useMemo(() => {
    return uniqueReservations.filter(
      (r) =>
        r.status === "cancellation_requested" ||
        r.status === "refunded" ||
        r.status === "cancelled"
    );
  }, [uniqueReservations]);

  const handleRefresh = () => {
    dispatch(getAuthorReservations());
  };

  return (
    <section className="py-8 w-full">
      {active === 1 ? (
        <UpcomingReservation data={upcomingReservations} />
      ) : active === 2 ? (
        <CompletedReservations data={completedReservations} />
      ) : active === 3 ? (
        <CancelledReservations
          data={cancelledAndRefundReservations}
          onRefresh={handleRefresh}
        />
      ) : active === 5 ? (
        <HostCouponsManager />
      ) : (
        <AllReservations data={uniqueReservations} />
      )}
    </section>
  );
};

ReservationsData.propTypes = {
  active: PropTypes.number,
};

export default ReservationsData;
