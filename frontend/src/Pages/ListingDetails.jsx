import { useParams, Link } from "react-router-dom";
import ListingTitle from "../components/ListingDetails/ListingTitle";
import ListingsPhotos from "../components/ListingDetails/ListingsPhotos";
import ListingDescriptions from "../components/ListingDetails/ListingDescriptions";
import ReservationCard from "../components/ListingDetails/ReservationCard";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getOneListingRoomsDetails } from "../redux/actions/houseActions";
import ListingDetailsPageSkeleton from "../components/skeletonLoading/ListingDetailsPageSkeleton";
import { useActiveReservations } from "../hooks/useActiveReservations";
import { FiCheckCircle, FiCalendar, FiArrowRight } from "react-icons/fi";

const ListingDetails = () => {
  const [isLoading, setIsLoading] = useState(true);
  const data = useSelector((state) => state.house.listingDetails);
  const params = useParams();
  const { getListingReservation } = useActiveReservations();

  const dispatch = useDispatch();

  // listing details data
  const listingData = data?.listing;
  const listedAuthor = data?.listingAuthor;

  const activeRes = getListingReservation(params.id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    async function getListingData() {
      await dispatch(getOneListingRoomsDetails(params.id));
      setIsLoading(false);
    }
    getListingData();
  }, [params.id, dispatch]);

  if (isLoading) {
    return <ListingDetailsPageSkeleton />;
  }

  const checkInFormatted = activeRes?.checkIn
    ? new Date(activeRes.checkIn).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const checkOutFormatted = activeRes?.checkOut
    ? new Date(activeRes.checkOut).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <main className="max-w-screen-xl xl:px-12 mx-auto py-7 px-5 sm:px-16 md:px-8">
      {/* Active Reservation Notification Banner */}
      {activeRes && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FiCheckCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>You have an active reservation for this motel!</span>
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 flex items-center gap-1.5">
                <FiCalendar size={12} />
                <span>
                  Order #{activeRes.orderId} • {checkInFormatted} — {checkOutFormatted} ({activeRes.nightStaying || 1} Night)
                </span>
              </p>
            </div>
          </div>

          <Link
            to="/users/profile"
            className="self-end sm:self-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>View My Booking</span>
            <FiArrowRight size={13} />
          </Link>
        </div>
      )}

      <section className="flex flex-col-reverse md:flex-col gap-7">
        {/* listing title & wishlist */}
        <ListingTitle listingData={listingData} />
        {/* listing photos */}
        <ListingsPhotos listingData={listingData} />
      </section>
      <section className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-6 md:gap-x-8 lg:gap-x-20 pt-8 sm:pt-12 md:pt-16">
        {/* listings description and details */}
        <div className="md:col-span-5 lg:col-span-4 order-2 md:order-1 flex flex-col min-h-[800px] pt-16 sm:pt-20 md:pt-0">
          <ListingDescriptions
            listingData={listingData}
            author={listedAuthor}
          />
        </div>
        {/* reservations of the listing */}
        <div className="md:col-span-3 lg:col-span-2 order-1 md:order-2 max-h-[900px]">
          <ReservationCard listingData={listingData} />
        </div>
      </section>
    </main>
  );
};

export default ListingDetails;
