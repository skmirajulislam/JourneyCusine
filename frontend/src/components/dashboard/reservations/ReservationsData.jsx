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

  const currentDate = new Date().toISOString();

  const upcomingReservations = useMemo(() => {
    return uniqueReservations.filter(
      (r) =>
        (r.status === "confirmed" || !r.status) &&
        (r.checkIn ? new Date(r.checkIn).toISOString() > currentDate : true)
    );
  }, [uniqueReservations, currentDate]);

  const completedReservations = useMemo(() => {
    return uniqueReservations.filter(
      (r) =>
        r.status === "confirmed" &&
        r.checkOut &&
        new Date(r.checkOut).toISOString() <= currentDate
    );
  }, [uniqueReservations, currentDate]);

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
