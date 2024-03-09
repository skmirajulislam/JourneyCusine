/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import search from "../../assets/basicIcon/searchRed.svg";
import PricingCheckingPopup from "../popUp/houseListing/PricingCheckingPopup";

const HouseHostingDetails = ({ setLatAndLong }) => {
  const [perNight, setPerNightChange] = useState(1);
  const [isTooltipActive, setActiveTooltip] = useState(false);
  const [showCheckPricePopup, setShowCheckPricePopup] = useState(false);
  const [country, setCountry] = useState(null);

  // type of space
  const [bedrooms, setBedrooms] = useState(0);
  const [typeOfRoom, setTypeOfRoom] = useState("Entire place");

  // calculating per night earning
  const perNightEarnig = parseInt(perNight * 37);

  const handlePerNightChange = (e) => {
    setPerNightChange(e.target.value);
  };

  useEffect(() => {
    const body = document.body;
    if (showCheckPricePopup) {
      body.classList.add("screen__lock");
    } else {
      body.classList.remove("screen__lock");
    }
  }, [showCheckPricePopup]);

  return (
    <>
      <div className=" flex flex-col gap-3 md:gap-5 md:mx-6">
        {/* heading */}
        <div className=" flex flex-col gap-2 text-[#222222] font-medium text-2xl md:text-5xl text-center">
          <h1 className=" text-[#ff385c]"> Motel it.</h1>
          <h1>You could earn</h1>
        </div>
        {/* amount in $ */}
        <p className=" text-center text-[#222222] font-semibold text-3xl my-2 md:text-7xl md:my-4">
          ${perNightEarnig}
        </p>
        {/* description of earning */}

        <div className="text-sm md:text-base text-[#222222] flex gap-1 justify-center h-5">
          {!isTooltipActive && (
            <>
              <span className=" font-medium underline underline-offset-3">
                {perNight} nights
              </span>
              <span> at an estimated $37 a night</span>
            </>
          )}
        </div>
        {/* scroll bar for nights increasing */}
        <div
          data-tip={`${perNight} nights`}
          className={`tooltip min-w-[250px] sm:min-w-[300px] md:min-w-[400px] mx-auto ${
            isTooltipActive ? " tooltip-open" : ""
          }`}
          onMouseEnter={() => {
            setActiveTooltip((prev) => !prev);
          }}
          onMouseLeave={() => {
            setActiveTooltip((prev) => !prev);
          }}
        >
          <input
            type="range"
            min={1}
            max={30}
            onChange={handlePerNightChange}
            value={perNight}
            className="range"
          />
        </div>
        {/* how pricing is defined */}
        <p className=" text-xs md:text-sm text-[#717171] underline font-medium text-center">
          Learn how we estimates you earnings
        </p>
        {/* selected places */}
        <div
          className=" flex flex-row gap-4 items-center min-w-[300px] md:min-w-[400px] rounded-full border border-[#dddddd] mx-auto mt-3 px-7 py-3 cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setShowCheckPricePopup((prev) => !prev);
          }}
        >
          <img src={search} alt="search" className="w-4 md:w-6" />
          <div className=" flex flex-col text-sm md:text-xs">
            <p>{country ? country.name : "Where's your place?"}</p>
            <p>
              {typeOfRoom} {"•"} {bedrooms} bedrooms
            </p>
          </div>
        </div>
      </div>
      {showCheckPricePopup && (
        <PricingCheckingPopup
          popup={showCheckPricePopup}
          setPopup={setShowCheckPricePopup}
          setLatAndLong={setLatAndLong}
          setBedrooms={setBedrooms}
          bedrooms={bedrooms}
          setTypeOfRoom={setTypeOfRoom}
          country={country}
          setCountry={setCountry}
        />
      )}
    </>
  );
};

export default HouseHostingDetails;
