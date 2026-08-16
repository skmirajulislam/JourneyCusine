import { Link } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import RoomFilterCard from "../../components/dashboard/listing/RoomFilterCard";
import AmenitiesFilterCard from "../../components/dashboard/listing/AmenitiesFilterCard";
import ListingStatus from "../../components/dashboard/listing/ListingStatus";
import ListingTable from "../../components/dashboard/listing/ListingTable";
import { useHostData } from "../../hooks/useHostData";

const Listing = () => {
  const { hostHouses: allListingsData = [] } = useHostData();
  const isSmallDevice = window.innerWidth < 640;

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-8 md:px-10 xl:px-20 pb-10">
      <section className="pt-8 flex flex-col gap-6">
        {/* about listings */}
        <div className="flex flex-row justify-between items-center">
          {/* number of listing */}
          <h1 className="text-xl sm:text-2xl text-[#111827] dark:text-white font-bold">
            {allListingsData.length} {allListingsData.length === 1 ? "listing" : "listings"}
          </h1>
          <Link
            to="/become-a-host"
            className="flex flex-row items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-[#111827] dark:text-white rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <HiPlus size={16} />
            Create listing
          </Link>
        </div>
        {/* filtering options */}
        <div className="flex flex-row flex-wrap gap-3">
          {!isSmallDevice && (
            <>
              <RoomFilterCard />
              <AmenitiesFilterCard />
              <ListingStatus />
            </>
          )}
        </div>
        {/* table contents */}
        <ListingTable />
      </section>
    </main>
  );
};

export default Listing;
