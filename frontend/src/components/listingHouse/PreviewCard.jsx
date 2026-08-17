import { useListingFlow } from "../../context/ListingFlowContext";
import { useCurrency } from "../../context/CurrencyContext";
import { AiFillStar } from "react-icons/ai";

const PreviewCard = () => {
  const { currentListingHouse: currentHouseData } = useListingFlow();
  const { symbol } = useCurrency();

  return (
    <>
      <div
        className="flex flex-col gap-3 rounded-3xl shadow-xl bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 max-w-sm p-4 cursor-pointer mx-auto transition-all hover:scale-[1.02] duration-200"
        onClick={() => window.my_modal_4?.showModal?.()}
      >
        <div className="relative">
          {currentHouseData?.photos?.[0] ? (
            <img
              src={currentHouseData?.photos[0]}
              alt={currentHouseData?.title || "Listing preview"}
              className="aspect-square object-cover rounded-2xl w-full border border-neutral-100 dark:border-neutral-800"
            />
          ) : (
            <div className="bg-neutral-200 dark:bg-neutral-800 aspect-square rounded-2xl flex items-center justify-center text-xs text-neutral-500">
              No photo available
            </div>
          )}
          <p className="text-xs font-bold text-[#111827] dark:text-white px-3 py-1.5 rounded-xl bg-white/90 dark:bg-black/70 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-700/60 absolute top-3 left-3 shadow-sm">
            Show preview
          </p>
        </div>
        <div className="grid grid-cols-2 justify-between items-start relative px-1 pt-1">
          <div className="text-sm">
            <p className="font-bold text-[#111827] dark:text-white truncate w-[190px]">
              {currentHouseData?.title || "Your listing title"}
            </p>
            <span className="flex flex-row items-center gap-1 mt-0.5">
              <p className="font-bold text-[#111827] dark:text-white">{symbol}{Number(currentHouseData?.basePrice || 50).toLocaleString()}</p>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">/ night</span>
            </span>
          </div>
          <span className="flex flex-row items-center justify-end gap-1 text-xs font-bold text-[#111827] dark:text-white">
            <span>New</span>
            <AiFillStar size={14} className="text-amber-500" />
          </span>
        </div>
      </div>

      {/* modal data for Preview Card */}
      <dialog id="my_modal_4" className="modal">
        <form method="dialog" className="modal-box w-11/12 max-w-5xl bg-white dark:bg-[#1e1e1e] text-[#111827] dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 md:p-8">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-neutral-500 dark:text-neutral-400">
            ✕
          </button>
          <h3 className="font-bold text-xl text-center text-[#111827] dark:text-white">Full preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto py-6">
            <div>
              {currentHouseData?.photos?.[0] ? (
                <img
                  src={currentHouseData?.photos[0]}
                  alt={currentHouseData?.title || "Houses"}
                  className="w-full aspect-[4/3] rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700"
                />
              ) : (
                <div className="w-full aspect-[4/3] rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm text-neutral-500">
                  No preview photo
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-2xl md:text-3xl text-[#111827] dark:text-white font-bold">
                {currentHouseData?.title || "Untitled Stay"}
              </h4>
              <p className="text-base font-semibold text-[#111827] dark:text-white mt-1">
                {currentHouseData?.privacyType || "Entire place"} • {currentHouseData?.houseType || "Motel"}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {currentHouseData?.floorPlan?.guests || 1} guests ·{" "}
                {currentHouseData?.floorPlan?.bedrooms || 0} bedrooms ·{" "}
                {currentHouseData?.floorPlan?.beds || 1} beds ·{" "}
                {currentHouseData?.floorPlan?.bathroomsNumber || 1} baths
              </p>
              <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {currentHouseData?.description || "Surround yourself with style in this standout space."}
              </p>
              <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
              <p className="text-base font-bold text-[#111827] dark:text-white">
                Location
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {currentHouseData?.location?.city?.name
                  ? `${currentHouseData?.location?.city?.name}, ${currentHouseData?.location?.country?.name || ""}`
                  : currentHouseData?.location?.addressLineOne || currentHouseData?.location?.country?.name || "Global location"}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                We’ll only share your address with guests who are booked as outlined in our privacy policy.
              </p>
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default PreviewCard;
