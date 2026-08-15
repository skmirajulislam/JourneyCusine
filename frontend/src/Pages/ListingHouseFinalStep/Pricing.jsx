import { useEffect, useState } from "react";

import { MdEdit, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { createNewHouse } from "../../redux/actions/houseActions";

const Pricing = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const [inputValue, setInputValue] = useState("168");
  const [showEdit, setShowEdit] = useState(true);
  const [showPricingTable, setShowPricingTable] = useState(false);
  const dispatch = useDispatch();

  const handleInputChange = (event) => {
    const newValue = event.target.value.replace(/[^0-9]/g, ""); // Allow only numeric characters
    setInputValue(newValue);
  };
  const handleEdit = () => {
    setShowEdit((prev) => !prev);
  };
  const handleShowPricingTable = () => {
    setShowPricingTable((prev) => !prev);
  };

  // Price calculation
  const basePrice = parseInt(inputValue ? inputValue : 0);
  const taxesPercentValue = 14;
  const hostServiceFee = 3;
  const taxBasedOnBasePrice = Math.round((basePrice * taxesPercentValue) / 100);
  const serviceFeeBasedOnBasePrice = Math.round(
    (basePrice * hostServiceFee) / 100
  );
  const totalPriceBeforeTax = basePrice + taxBasedOnBasePrice;
  const totalAuthorEarned = basePrice - serviceFeeBasedOnBasePrice;

  const [priceBeforeTaxes, setPriceBeforeTaxes] = useState(totalPriceBeforeTax);
  const [authorEarnedPrice, setAuthorEarnedPrice] = useState(totalAuthorEarned);

  useEffect(() => {
    setPriceBeforeTaxes(totalPriceBeforeTax);
    setAuthorEarnedPrice(totalAuthorEarned);
    dispatch(
      createNewHouse(
        newHouseData?.houseType,
        newHouseData?.privacyType,
        newHouseData?.location,
        newHouseData?.floorPlan,
        newHouseData?.amenities,
        newHouseData?.photos,
        newHouseData?.title,
        newHouseData?.highlights,
        newHouseData?.description,
        newHouseData?.guestType,
        totalPriceBeforeTax,
        totalAuthorEarned,
        basePrice
      )
    );
  }, [
    basePrice,
    dispatch,
    newHouseData?.amenities,
    newHouseData?.description,
    newHouseData?.floorPlan,
    newHouseData?.guestType,
    newHouseData?.highlights,
    newHouseData?.houseType,
    newHouseData?.location,
    newHouseData?.photos,
    newHouseData?.privacyType,
    newHouseData?.title,
    totalAuthorEarned,
    totalPriceBeforeTax,
  ]);

  return (
    <div className="flex flex-col max-w-screen-md mx-auto my-6 min-h-[70vh]">
      <div>
        <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium">
          Now, set your price
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400">
          You can change it anytime.
        </p>
      </div>
      {/* Price */}
      <div className="mx-auto mt-10">
        <div className="flex flex-row items-center relative">
          <span className="text-[#222222] dark:text-white text-4xl sm:text-6xl md:text-9xl font-semibold">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={inputValue}
            onChange={handleInputChange}
            className="bg-gray-100 dark:bg-[#252525] text-black dark:text-white rounded-2xl p-3 text-4xl sm:text-6xl md:text-9xl font-semibold focus:outline-none placeholder-gray-400 dark:placeholder-neutral-600 max-w-[308px] mx-auto border border-neutral-300 dark:border-neutral-700"
            onFocus={handleEdit}
            onBlur={handleEdit}
          />
          {showEdit && (
            <div
              className={`absolute bottom-12 p-2 rounded-full shadow-sm hover:shadow-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-[#111827] dark:text-white cursor-pointer hidden lg:block ${
                inputValue.length >= 4
                  ? "-right-9"
                  : inputValue.length == 2
                  ? "right-32"
                  : inputValue.length <= 1
                  ? "right-52"
                  : "right-7"
              }`}
            >
              <MdEdit size={18} />
            </div>
          )}
        </div>
        {/* calculations */}
        {!showPricingTable && (
          <div className="flex justify-center items-center gap-1.5 cursor-pointer mt-4 text-[#717171] dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors" onClick={handleShowPricingTable}>
            <p className="text-sm">
              Guest price before taxes ${priceBeforeTaxes}
            </p>
            <MdKeyboardArrowDown size={22} />
          </div>
        )}
      </div>
      {/* group-open:animate-fadeIn */}
      {showPricingTable && (
        <div className="mt-5 flex flex-col gap-4 min-w-[300px] md:min-w-[600px] mx-auto">
          <div className="flex flex-col gap-3 px-6 py-6 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e]">
            {/* house price calculation */}
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#717171] dark:text-neutral-400">Base Price</p>
              <p className="text-sm text-[#717171] dark:text-neutral-400">${basePrice}</p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#717171] dark:text-neutral-400">Guest service fee</p>
              <p className="text-sm text-[#717171] dark:text-neutral-400">${taxBasedOnBasePrice}</p>
            </div>
            <hr className="border-neutral-200 dark:border-neutral-800" />
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#222222] dark:text-white font-medium">
                Guest price before taxes
              </p>
              <p className="text-sm text-[#222222] dark:text-white font-bold">
                ${priceBeforeTaxes}
              </p>
            </div>
          </div>
          {/* host earning calculation */}

          <div className="flex flex-col gap-3 px-6 py-6 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e]">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#717171] dark:text-neutral-400">Base Price</p>
              <p className="text-sm text-[#717171] dark:text-neutral-400">${basePrice}</p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#717171] dark:text-neutral-400">Host service fee</p>
              <p className="text-sm text-[#717171] dark:text-neutral-400">
                - ${serviceFeeBasedOnBasePrice}
              </p>
            </div>
            <hr className="border-neutral-200 dark:border-neutral-800" />
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#222222] dark:text-white font-medium">You earn</p>
              <p className="text-sm text-[#222222] dark:text-white font-bold">
                ${authorEarnedPrice}
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-1 cursor-pointer text-[#717171] dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors" onClick={handleShowPricingTable}>
            <p className="text-sm">
              Show less
            </p>
            <MdKeyboardArrowUp size={22} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
