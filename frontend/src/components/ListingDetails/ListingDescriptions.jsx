import ListingDescriptionPopup from "../popUp/ListingDescriptionPopup";
import Map from "../../components/Map";
import { amenities } from "./amenitiesApi";
import { AiOutlineRight } from "react-icons/ai";

/* eslint-disable react/prop-types */
const ListingDescriptions = ({ listingData, author }) => {
  const latitude = Number(listingData?.location?.city?.latitude);
  const longitude = Number(listingData?.location?.city?.longitude);
  const latLong = [latitude, longitude];
  const latLongNaN = isNaN(latitude) || isNaN(longitude);

  const hostName = author?.name?.firstName
    ? `${author.name.firstName}${
        author.name.lastName && author.name.lastName !== "guest"
          ? " " + author.name.lastName
          : ""
      }`
    : "Host";

  const hostPhoto =
    author?.profileImg ||
    author?.user_image ||
    author?.avatar ||
    author?.photo ||
    listingData?.authorDetails?.profileImg;

  return (
    <>
      <div className="flex flex-row justify-between items-center min-h-16 py-2">
        <div className="flex flex-col gap-1 text-[#222222] dark:text-white">
          <h2 className="text-xl md:text-[22px] font-semibold text-[#222222] dark:text-white">
            {listingData?.houseType ? `Entire ${listingData.houseType}` : "Entire Cabin"} is hosted by {hostName}
          </h2>
          <p className="text-sm md:text-base text-[#717171] dark:text-[#a0a0a0]">
            {listingData?.floorPlan?.guests || 1} guests ·{" "}
            {listingData?.floorPlan?.bedrooms || 1} bedroom ·{" "}
            {listingData?.floorPlan?.beds || 1} beds ·{" "}
            {listingData?.floorPlan?.bathroomsNumber || 1} bath
          </p>
        </div>
        {/* host profile img */}
        <div className="shrink-0 ml-4">
          {hostPhoto ? (
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-300 dark:border-neutral-700 shadow-sm bg-neutral-100 dark:bg-neutral-800">
              <img
                src={hostPhoto}
                alt={hostName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `<div class="w-full h-full bg-[#ff385c] flex items-center justify-center text-white font-bold text-xl">${hostName.slice(0, 1).toUpperCase()}</div>`;
                }}
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-[#ff385c] dark:bg-[#ff385c] flex items-center justify-center rounded-full text-white font-bold text-xl shadow-sm">
              {hostName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <hr className="h-[1.2px] w-full bg-[#dddddd] dark:bg-[#333333] border-none my-8" />

      {/* description in short */}
      <div className="text-[#333333] dark:text-[#e0e0e0] leading-relaxed">
        <p className="whitespace-pre-wrap">
          {listingData?.description?.slice(0, 300)}
          {listingData?.description?.length > 300 ? "..." : ""}
        </p>
      </div>

      {/* modal button */}
      <button
        className="flex pt-5 underline text-black dark:text-white font-medium items-center gap-1 max-w-[140px] cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => document.getElementById("listing_modal").showModal()}
      >
        Show more
        <AiOutlineRight size={16} />
      </button>

      <hr className="h-[1.2px] w-full bg-[#dddddd] dark:bg-[#333333] border-none my-8" />

      {/* amenities / what's this place is offering */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[22px] text-[#222222] dark:text-white font-semibold">
          What this place offers
        </h2>
        <div className="grid grid-cols-2 gap-x-3 md:gap-x-0 gap-y-4">
          {amenities.map((item, i) => {
            if (listingData?.amenities?.includes(item?.name)) {
              return (
                <div key={i} className="flex flex-row gap-4 items-center">
                  <item.svg size={24} className="text-[#222222] dark:text-white opacity-80" />
                  <p className="text-xs sm:text-sm md:text-base text-[#222222] dark:text-[#e0e0e0]">
                    {item?.name}
                  </p>
                </div>
              );
            }
          })}
        </div>
      </div>

      <hr className="h-[1.2px] w-full bg-[#dddddd] dark:bg-[#333333] border-none my-8" />

      {/* location of the listing */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[22px] text-[#222222] dark:text-white font-semibold">
          Where you&apos;ll be
        </h2>
        {/* map */}
        <div className="w-full min-h-[400px]">
          {!latLongNaN && (
            <Map latAndLong={latLong} zoom={6} key="listingMap" />
          )}
        </div>
      </div>

      {/* full description modal */}
      <ListingDescriptionPopup description={listingData?.description} />
    </>
  );
};

export default ListingDescriptions;
