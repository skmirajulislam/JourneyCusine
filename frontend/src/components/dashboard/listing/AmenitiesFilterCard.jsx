import { MdKeyboardArrowDown } from "react-icons/md";
import { amenititesData } from "./AmenitiesFilterData";

const AmenitiesFilterCard = () => {
  const isDisabled = true;
  return (
    <div className="dropdown dropdown-bottom">
      <label
        tabIndex={0}
        className="flex flex-row gap-1.5 items-center text-xs sm:text-sm font-semibold text-[#111827] dark:text-white cursor-pointer bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-[#111827] dark:hover:border-neutral-400 transition-all shadow-xs"
      >
        Amenities
        <MdKeyboardArrowDown size={18} />
      </label>
      <div
        tabIndex={0}
        className="dropdown-content z-30 menu p-5 bg-white dark:bg-[#1e1e1e] rounded-3xl min-w-[320px] sm:min-w-[450px] flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800 shadow-2xl -left-10 md:left-0 mt-2"
      >
        {/* filter options */}
        <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 max-h-[220px] overflow-y-auto pr-1">
          {amenititesData?.map((data, i) => {
            return (
              <label key={i} className="flex flex-row gap-2.5 items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-md accent-[#ff385c] cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                  {data.name}
                </span>
              </label>
            );
          })}
        </div>
        <div className="pt-2">
          <hr className="border-t border-neutral-200 dark:border-neutral-800 mb-4" />
          {/* buttons */}
          <div className="flex flex-row justify-between items-center">
            <button
              type="button"
              className="underline text-xs sm:text-sm font-semibold disabled:cursor-not-allowed disabled:text-neutral-400 dark:disabled:text-neutral-600 text-[#111827] dark:text-white cursor-pointer"
              disabled={isDisabled}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-xs sm:text-sm font-bold w-[90px] py-2.5 rounded-xl bg-[#111827] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 transition-all text-white dark:text-[#111827] shadow-sm cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesFilterCard;
