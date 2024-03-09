import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { HiPlus } from "react-icons/hi";
import RoomFilterCard from "../../components/dashboard/listing/RoomFilterCard";
import AmenitiesFilterCard from "../../components/dashboard/listing/AmenitiesFilterCard";
import ListingStatus from "../../components/dashboard/listing/ListingStatus";
import ListingTable from "../../components/dashboard/listing/ListingTable";

const Listing = () => {
  const allListingsData = useSelector((state) => state.house.housesData);
  const isSmallDevice = window.innerWidth < 640;
  return (
    <main className=" max-w-screen-xl mx-auto px-4 sm:px-8 md:px-10 xl:px-20 pb-10">
      <section className=" pt-8 flex flex-col gap-5">
        {/* about listings */}
        <div className=" flex flex-row justify-between items-center">
          {/* number of listing */}
          <h3 className=" text-xl text-[#222222] font-medium">
            {allListingsData.length} listings
          </h3>
          <Link
            to="/become-a-host"
            className=" flex flex-row items-center gap-[6px] text-sm font-medium px-4 py-3 bg-white hover:bg-[#f1f1f1] border-[#b0b0b0] border rounded-lg transition duration-200 ease-in"
          >
            <HiPlus size={16} />
            Create listing
          </Link>
        </div>
        {/* filtering options */}
        <div className=" flex flex-row gap-5">
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
