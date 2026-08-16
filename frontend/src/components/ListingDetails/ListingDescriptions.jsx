import ListingDescriptionPopup from "../popUp/ListingDescriptionPopup";
import Map from "../../components/Map";
import { amenities } from "./amenitiesApi";
import { AiOutlineRight } from "react-icons/ai";
import { FiMessageSquare } from "react-icons/fi";
import PropertyReviews from "../reviews/PropertyReviews";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../hooks/useAuth";

const ListingDescriptions = ({ listingData, author }) => {
  const { openChatWithHost } = useChat();
  const { user } = useAuth();

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
    author?.profilePic ||
    listingData?.authorDetails?.profileImg;

  const authorId = author?._id || listingData?.author?._id || listingData?.author;
  const isHost = Boolean(user?._id && authorId && String(user._id) === String(authorId));

  const handleContactHost = () => {
    openChatWithHost({
      hostId: authorId,
      listingId: listingData?._id,
    });
  };

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

          {!isHost && (
            <div className="mt-2">
              <button
                type="button"
                onClick={handleContactHost}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-900 dark:text-white transition shadow-2xs cursor-pointer"
              >
                <FiMessageSquare size={14} className="text-[#ff385c]" />
                <span>Contact Host</span>
              </button>
            </div>
          )}
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

      {/* Verified Badges & Highlights Section */}
      <div className="my-8 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 text-base shadow-2xs">
            ⚡
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              150+ Mbps High-Speed Wi-Fi
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
              Verified fast Wi-Fi suitable for 4K video streaming, team calls, and remote work.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 text-base shadow-2xs">
            🍲
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Authentic Dining &amp; Culinary Secrets
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
              Host offers homemade dining add-ons and curated neighborhood food guides.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-[#ff385c] flex items-center justify-center shrink-0 text-base shadow-2xs">
            🛡️
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Verified Journey Guarantee
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
              Identity verified host with secure Razorpay checkout and 24/7 support.
            </p>
          </div>
        </div>
      </div>

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

      {/* Reviews & Guest Feedback Section */}
      <PropertyReviews listingId={listingData?._id} />

      {/* full description modal */}
      <ListingDescriptionPopup description={listingData?.description} />
    </>
  );
};

export default ListingDescriptions;
