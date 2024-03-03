import { MdKeyboardArrowDown } from "react-icons/md";

const ListingStatus = () => {
  return (
    <div className="dropdown dropdown-bottom">
      <label
        tabIndex={0}
        className=" flex flex-row gap-1 items-center text-sm text-[#222222] cursor-pointer bg-white  
         hover:bg-[#f1f1f1] px-4 py-[6px] rounded-full border border-[#b0b0b0] hover:border-[#222222] transition duration-200 ease-in"
      >
        Listing status
        <MdKeyboardArrowDown size={20} />
      </label>
      <div
        tabIndex={0}
        className="dropdown-content z-30 menu p-4 bg-base-100 rounded-box min-w-[250px] sm:min-w-[300px] flex flex-col gap-4 border border-neutral-200 shadow-lg -left-20 md:left-0"
      >
        <div className=" flex flex-col gap-5">
          <div className=" flex flex-row items-center gap-2">
            <input
              type="checkbox"
              id="input1"
              className=" w-4 h-4 rounded-md cursor-pointer"
            />
            <label
              htmlFor="input1"
              className=" text-sm text-[#717171] cursor-pointer"
            >
              In progress
            </label>
          </div>
          <div className=" flex flex-row items-center gap-2">
            <input
              type="checkbox"
              id="input2"
              className=" w-4 h-4 rounded-md cursor-pointer"
            />
            <label
              htmlFor="input2"
              className=" text-sm text-[#717171] cursor-pointer"
            >
              Completed
            </label>
          </div>
        </div>
        <hr className=" h-[1px] bg-[#dddddd] mb-5 mt-2" />
        {/* buttons */}
        <div className=" flex flex-row justify-between items-center">
          <button
            className="underline text-sm disabled:cursor-not-allowed disabled:text-gray-300 cursor-pointer"
            // disabled={isDisabled}
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
  );
};

export default ListingStatus;
