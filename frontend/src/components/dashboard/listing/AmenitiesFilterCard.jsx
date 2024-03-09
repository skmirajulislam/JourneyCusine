import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

import { amenititesData } from "./AmenitiesFilterData";

const AmenitiesFilterCard = () => {
  const [isDisabled, setIsDisabled] = useState(true);
  return (
    <div className="dropdown dropdown-bottom">
      <label
        tabIndex={0}
        className=" flex flex-row gap-1 items-center text-sm text-[#222222] cursor-pointer bg-white  
         hover:bg-[#f1f1f1] px-4 py-[6px] rounded-full border border-[#b0b0b0] hover:border-[#222222] transition duration-200 ease-in mb-3"
      >
        Amenities
        <MdKeyboardArrowDown size={20} />
      </label>
      <div
        tabIndex={0}
        className="dropdown-content z-30 menu p-4 bg-base-100 rounded-box min-w-[320px] sm:min-w-[450px] flex flex-col gap-4 border border-neutral-200 shadow-lg -left-20 md:left-0"
      >
        {/* filter options */}
        <div className=" grid grid-cols-2 gap-y-4 gap-x-7 max-h-[200px] overflow-x-auto">
          {amenititesData?.map((data, i) => {
            return (
              <div key={i} className=" flex flex-row gap-2 items-center">
                <input
                  type="checkbox"
                  className=" w-4 h-4 rounded-md cursor-pointer"
                />
                <p className=" text-sm text-[#717171]">{data.name}</p>
              </div>
            );
          })}
        </div>
        <div className="">
          <hr className=" h-[1px] bg-[#dddddd] my-5" />
          {/* buttons */}
          <div className=" flex flex-row justify-between items-center">
            <button
              className="underline text-sm disabled:cursor-not-allowed disabled:text-gray-300 cursor-pointer"
              disabled={isDisabled}
              // onClick={handleClearData}
            >
              Clear
            </button>
            <button className=" text-base w-[90px] py-3 rounded-lg bg-[#222222] hover:bg-black transition duration-300 text-white">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesFilterCard;
