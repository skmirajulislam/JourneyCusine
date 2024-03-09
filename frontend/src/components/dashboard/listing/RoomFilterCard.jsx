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
    }
  }, [bedroomsNumber, bedsNumber, bathroomsNumber]);

  return (
    <div className="dropdown dropdown-bottom">
      <label
        tabIndex={0}
        className=" flex flex-row gap-1 items-center text-sm text-[#222222] cursor-pointer bg-white  
         hover:bg-[#f1f1f1] px-4 py-[6px] rounded-full border border-[#b0b0b0] hover:border-[#222222] transition duration-200 ease-in"
      >
        Rooms and beds
        <MdKeyboardArrowDown size={20} />
      </label>
      <div
        tabIndex={0}
        className="dropdown-content z-30 menu p-4 bg-base-100 rounded-box min-w-[300px] flex flex-col gap-4 border border-neutral-200 shadow-lg"
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
        <hr className=" h-[1px] bg-[#dddddd] my-5" />
        {/* buttons */}
        <div className=" flex flex-row justify-between items-center">
          <button
            className="underline text-sm disabled:cursor-not-allowed disabled:text-gray-300 cursor-pointer"
            disabled={isDisabled}
            onClick={handleClearData}
          >
            Clear
          </button>
          <button className=" text-base w-[90px] py-3 rounded-lg bg-[#222222] hover:bg-black transition duration-300 text-white">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomFilterCard;
