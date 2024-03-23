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
  }, [inputValue]);

  return (
    <div className=" flex flex-col max-w-screen-md mx-auto my-6 min-h-[70vh]">
      <div>
        <h1 className=" text-[#222222] text-xl sm:text-2xl md:text-[32px] font-medium">
          Now, set your price
        </h1>
        <p className=" text-sm sm:text-base md:text-lg text-[#717171]">
          You can change it anytime.
        </p>
      </div>
      {/* Price */}
      <div className=" mx-auto mt-10">
        <div className=" flex flex-row items-center relative">
          <span className=" text-[#222222] text-4xl sm:text-6xl md:text-9xl font-semibold">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={inputValue}
            onChange={handleInputChange}
            className="bg-gray-200 text-black rounded-lg p-3 text-4xl sm:text-6xl md:text-9xl font-semibold focus:outline-none placeholder-gray-200 max-w-[308px] mx-auto"
            onFocus={handleEdit}
            onBlur={handleEdit}
          />
          {showEdit && (
            <div
              className={` absolute  bottom-12 p-1 rounded-full shadow-sm hover:shadow-md border cursor-pointer hidden lg:block ${
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
          <div className=" flex justify-center items-center cursor-pointer">
            <p
              className=" text-sm text-[#717171]"
              onClick={handleShowPricingTable}
            >
              Guest price before taxes ${priceBeforeTaxes}
            </p>
            <div onClick={handleShowPricingTable}>
              <MdKeyboardArrowDown size={24} />
            </div>
          </div>
        )}
      </div>
      {/* group-open:animate-fadeIn */}
      {showPricingTable && (
        <div className=" mt-5 flex flex-col gap-4 min-w-[300px] md:min-w-[600px] mx-auto">
          <div className=" flex flex-col gap-3 px-4 py-6 rounded-xl border border-[#b0b0b0]">
            {/* house price calculation */}
            <div className=" flex flex-row justify-between items-center">
              <p className=" text-sm text-[#717171]">Base Price</p>
              <p className=" text-sm text-[#717171]">${basePrice}</p>
            </div>
            <div className=" flex flex-row justify-between items-center">
              <p className=" text-sm text-[#717171]">Guest service fee</p>
              <p className=" text-sm text-[#717171]">${taxBasedOnBasePrice}</p>
            </div>
            <hr className=" bg-[#b0b0b0] h-[1px]" />
            <div className=" flex flex-row justify-between items-center">
              <p className=" text-sm text-[#222222] font-medium">
                Guest price before taxes
              </p>
              <p className=" text-sm text-[#222222] font-medium">
                ${priceBeforeTaxes}
              </p>
            </div>
          </div>
          {/* host earning calculation */}

          <div className=" flex flex-col gap-3 px-4 py-6 rounded-xl border border-[#b0b0b0] ">
            <div className=" flex flex-row justify-between items-center">
              <p className=" text-sm text-[#717171]">Base Price</p>
              <p className=" text-sm text-[#717171]">${basePrice}</p>
            </div>
            <div className=" flex flex-row justify-between items-center">
              <p className=" text-sm text-[#717171]">Host service fee</p>
              <p className=" text-sm text-[#717171]">
                - ${serviceFeeBasedOnBasePrice}
              </p>
            </div>
            <hr className=" bg-[#b0b0b0] h-[1px]" />
            <div className=" flex flex-row justify-between items-center">
              <p className=" text-sm text-[#222222] font-medium">You earn</p>
              <p className=" text-sm text-[#222222] font-medium">
                ${authorEarnedPrice}
              </p>
            </div>
          </div>
          <div className=" flex justify-center items-center cursor-pointer">
            <p
              className=" text-sm text-[#717171]"
              onClick={handleShowPricingTable}
            >
              Show less
            </p>
            <div onClick={handleShowPricingTable}>
              <MdKeyboardArrowUp size={24} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
