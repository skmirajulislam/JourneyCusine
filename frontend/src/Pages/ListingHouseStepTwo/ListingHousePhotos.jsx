import { useSelector } from "react-redux";
import PhotosCard from "../../components/listingHouse/PhotosCard";

const ListingHousePhotos = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const houseType = newHouseData?.houseType || "stay";

  return (
    <div className="flex flex-col gap-8 max-w-screen-md mx-auto my-6 min-h-[70vh]">
      <div className="flex flex-col gap-2">
        <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium capitalize">
          Add photos of your {houseType}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400">
          Upload real, high-quality photos of your rooms, views, and amenities.
          All images are automatically verified for safety and quality compliance.
        </p>
      </div>

      <PhotosCard />
    </div>
  );
};

export default ListingHousePhotos;
