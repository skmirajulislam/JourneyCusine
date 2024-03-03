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
  console.log(latLongNaN, "lat long");
  return (
    <>
      <div className=" flex flex-row justify-between items-center max-h-16">
        <div className=" flex flex-col gap-1 text-[#222222]">
          <h2 className=" text-xl md:text-[22px] font-medium">
            Entire Cabin is hosted by {author?.name?.firstName}
          </h2>
          <p className=" text-sm md:text-base">
            {listingData?.floorPlan?.guests} guests ·{" "}
            {listingData?.floorPlan?.bedrooms} bedroom ·{" "}
            {listingData?.floorPlan?.beds} beds ·{" "}
            {listingData?.floorPlan?.bathroomsNumber} bath
          </p>
        </div>
        {/* profile img */}
        <div>
          {author?.profileImg ? (
            <img
              src={author?.profileImg}
              alt="user"
              className=" w-16 rounded-full"
            />
          ) : (
            <div className=" w-14 h-14 bg-[#222222] flex items-center justify-center rounded-full">
              <p className=" text-[#efefef] text-lg font-semibold">
                {author?.name?.firstName?.slice(0, 1)}
              </p>
            </div>
          )}
        </div>
      </div>
      <hr className=" h-[1.2px] w-full bg-[#dddddd] my-8" />
      {/* description in short */}
      <div>
        <p className=" whitespace-pre-wrap">
          {listingData?.description?.slice(0, 300)}...
        </p>
      </div>
      {/* modal button */}
      <button
        className=" flex pt-7 underline text-black font-medium items-center gap-1 max-w-[120px]"
        onClick={() => document.getElementById("listing_modal").showModal()}
      >
        Show more
        <AiOutlineRight size={18} />
      </button>

      <hr className=" h-[1.2px] w-full bg-[#dddddd] my-8" />

      {/* amenities / what's this place is offering */}
      <div className=" flex flex-col gap-6">
        <h2 className="text-[22px] text-[#222222] font-medium">
          What this place offers
        </h2>
        <div className=" grid grid-cols-2 gap-x-3 md:gap-x-0 gap-y-4">
          {amenities.map((item, i) => {
            if (listingData?.amenities?.includes(item?.name)) {
              return (
                <div key={i} className=" flex flex-row gap-4 items-center">
                  <item.svg size={26} opacity={0.8} />
                  <p className="text-xs sm:text-sm md:text-base text-[#222222]">
                    {item?.name}
                  </p>
                </div>
              );
            }
          })}
        </div>
      </div>

      <hr className=" h-[1.2px] w-full bg-[#dddddd] my-8" />

      {/* location of the listing */}
      <div className=" flex flex-col gap-6">
        <h2 className="text-[22px] text-[#222222] font-medium">
          Where you&apos;ll be
        </h2>
        {/* map */}
        <div className=" w-full min-h-[400px]">
          {!latLongNaN && (
            <Map latAndLong={latLong} zoom={6} key="listingMap" />
          )}
        </div>
      </div>

      {/* reviews section */}
      {/* {listingData?.review ? <></> : <></>} */}

      {/* full description modal */}
      <ListingDescriptionPopup description={listingData?.description} />
    </>
  );
};

export default ListingDescriptions;
