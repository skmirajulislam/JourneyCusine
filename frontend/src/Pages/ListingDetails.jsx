import { useParams } from "react-router-dom";
import ListingTitle from "../components/ListingDetails/ListingTitle";
import ListingsPhotos from "../components/ListingDetails/ListingsPhotos";
import ListingDescriptions from "../components/ListingDetails/ListingDescriptions";
import ReservationCard from "../components/ListingDetails/ReservationCard";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getOneListingRoomsDetails } from "../redux/actions/houseActions";
import ListingDetailsPageSkeleton from "../components/skeletonLoading/ListingDetailsPageSkeleton";

const ListingDetails = () => {
  const [isLoading, setIsLoading] = useState(true);
  const data = useSelector((state) => state.house.listingDetails);
  const params = useParams();

  const dispatch = useDispatch();

  // listing details data
  const listingData = data?.listing;
  const listedAuthor = data?.listingAuthor;

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
  return (
    <main className="max-w-screen-xl xl:px-12 mx-auto py-7 px-5 sm:px-16 md:px-8">
      <section className=" flex flex-col-reverse md:flex-col gap-7">
        {/* listing title & wishlist */}
        <ListingTitle listingData={listingData} />
        {/* listing photos */}
        <ListingsPhotos listingData={listingData} />
      </section>
      <section className=" grid grid-cols-1 md:grid-cols-8 lg:grid-cols-6 md:gap-x-8 lg:gap-x-20 pt-8 sm:pt-12 md:pt-16">
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
