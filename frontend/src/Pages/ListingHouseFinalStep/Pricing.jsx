import { useEffect, useState } from "react";

import { MdEdit, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { createNewHouse } from "../../redux/actions/houseActions";
import { useCurrency } from "../../context/CurrencyContext";

const Pricing = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const { symbol, currency } = useCurrency();
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
  const basePrice = parseInt(inputValue ? inputValue : 0, 10);
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
          You can change it anytime ({currency}).
        </p>
      </div>
      {/* Price */}
      <div className="mx-auto mt-10">
        <div className="flex flex-row items-center relative">
          <span className="text-[#222222] dark:text-white text-4xl sm:text-6xl md:text-9xl font-semibold">
            {symbol}
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
            <span
              onClick={handleEdit}
              className="p-1 rounded-full border border-[#222222] dark:border-neutral-600 absolute right-4 bottom-7 text-[#222222] dark:text-white"
            >
              <MdEdit size={16} />
            </span>
          )}
        </div>
      </div>
      {/* more description */}
      <div className="mx-auto mt-8 flex flex-col justify-center items-center">
        <div
          onClick={handleShowPricingTable}
          className="flex flex-row justify-center items-center gap-1 cursor-pointer"
        >
          <span className="text-sm text-[#717171] dark:text-neutral-400">
            Guest price before taxes {symbol}{priceBeforeTaxes}
          </span>
          <MdKeyboardArrowDown size={24} className="text-[#717171] dark:text-neutral-400" />
        </div>
        <p className="text-sm text-[#717171] dark:text-neutral-400 mt-2">
          Earn {symbol}{authorEarnedPrice} per night after standard hosting fee
        </p>
      </div>

      {/* pricing modal view */}
      {showPricingTable && (
        <div className="mt-5 flex flex-col gap-4 min-w-[300px] md:min-w-[600px] mx-auto">
          <div className="flex flex-col gap-3 px-6 py-6 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e]">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#717171] dark:text-neutral-400">Base Price</p>
              <p className="text-sm text-[#717171] dark:text-neutral-400">{symbol}{basePrice}</p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#717171] dark:text-neutral-400">Guest service fee (14%)</p>
              <p className="text-sm text-[#717171] dark:text-neutral-400">{symbol}{taxBasedOnBasePrice}</p>
            </div>
            <hr className="border-neutral-200 dark:border-neutral-800" />
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#222222] dark:text-white font-medium">
                Guest price before taxes
              </p>
              <p className="text-sm text-[#222222] dark:text-white font-bold">
                {symbol}{priceBeforeTaxes}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 py-6 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e]">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#717171] dark:text-neutral-400">Base Price</p>
              <p className="text-sm text-[#717171] dark:text-neutral-400">{symbol}{basePrice}</p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#717171] dark:text-neutral-400">Host service fee (3%)</p>
              <p className="text-sm text-[#717171] dark:text-neutral-400">
                - {symbol}{serviceFeeBasedOnBasePrice}
              </p>
            </div>
            <hr className="border-neutral-200 dark:border-neutral-800" />
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#222222] dark:text-white font-medium">You earn</p>
              <p className="text-sm text-[#222222] dark:text-white font-bold">
                {symbol}{authorEarnedPrice}
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
