import { MdKeyboardArrowDown } from "react-icons/md";
import FloorPlanCard from "../../listingHouse/FloorPlanCard";
import { useEffect, useState } from "react";

const RoomFilterCard = () => {
  const [bedroomsNumber, setBedroomsNumber] = useState(0);
  const [bedsNumber, setBedsNumber] = useState(0);
  const [bathroomsNumber, setBathroomsNumber] = useState(0);
  const [isDisabled, setIsDisabled] = useState(true);

  const handleClearData = () => {
    setBathroomsNumber(0);
    setBedroomsNumber(0);
    setBedsNumber(0);
  };

  useEffect(() => {
    if (bedroomsNumber !== 0 || bedsNumber !== 0 || bathroomsNumber !== 0) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [bedroomsNumber, bedsNumber, bathroomsNumber]);

  return (
    <div className="dropdown dropdown-bottom">
      <label
        tabIndex={0}
        className="flex flex-row gap-1.5 items-center text-xs sm:text-sm font-semibold text-[#111827] dark:text-white cursor-pointer bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-[#111827] dark:hover:border-neutral-400 transition-all shadow-xs"
      >
        Rooms and beds
        <MdKeyboardArrowDown size={18} />
      </label>
      <div
        tabIndex={0}
        className="dropdown-content z-30 menu p-5 bg-white dark:bg-[#1e1e1e] rounded-3xl min-w-[300px] flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800 shadow-2xl mt-2"
      >
        <FloorPlanCard
          name={"Bedrooms"}
          number={bedroomsNumber}
          setNumber={setBedroomsNumber}
          filter={true}
        />
        <FloorPlanCard
          name={"Beds"}
          number={bedsNumber}
          setNumber={setBedsNumber}
          filter={true}
        />
        <FloorPlanCard
          name={"Bathrooms"}
          number={bathroomsNumber}
          setNumber={setBathroomsNumber}
          filter={true}
        />
        <hr className="border-t border-neutral-200 dark:border-neutral-800 my-2" />
        {/* buttons */}
        <div className="flex flex-row justify-between items-center pt-1">
          <button
            type="button"
            className="underline text-xs sm:text-sm font-semibold disabled:cursor-not-allowed disabled:text-neutral-400 dark:disabled:text-neutral-600 text-[#111827] dark:text-white cursor-pointer"
            disabled={isDisabled}
            onClick={handleClearData}
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
  );
};

export default RoomFilterCard;
