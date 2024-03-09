/* eslint-disable react/prop-types */
// import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Country } from "country-state-city";
import Select from "react-select";

import closeIcon from "../../../assets/basicIcon/closeIcon.svg";
import location from "../../../assets/basicIcon/location.png";
import plus from "../../../assets/basicIcon/plus.png";
import minus from "../../../assets/basicIcon/minus.png";

const PricingCheckingPopup = ({
  popup,
  setPopup,
  setLatAndLong,
  setBedrooms,
  bedrooms,
  setTypeOfRoom,
  country,
  setCountry,
}) => {
  const popUpRef = useRef(null);
  const [isRoomPrivate, setIsRoomPrivate] = useState(false);
  const [isBedroomsLimitReached, setIsBedroomsLimitReached] = useState(false);
  const [isBedroomsLimitZero, setIsBedroomsLimitZero] = useState(false);

  const handleIncrease = useCallback(() => {
    if (bedrooms === 8) {
      setIsBedroomsLimitReached(true);
      return;
    } else {
      setBedrooms((prev) => prev + 1);
      setIsBedroomsLimitZero(false);
    }
  }, [bedrooms, setBedrooms]);

  const handleDecrease = useCallback(() => {
    if (bedrooms === 0) {
      setIsBedroomsLimitZero(true);
      return;
    } else {
      setBedrooms((prev) => prev - 1);
      setIsBedroomsLimitReached(false);
    }
  }, [bedrooms, setBedrooms]);

  const handleUpdate = () => {
    const latitude = parseFloat(country?.latitude);
    const longitude = parseFloat(country?.longitude);
    if (country) {
      setLatAndLong([latitude, longitude]);
    }
    setPopup(false);
  };

  //   useEffect(() => {
  //     const latitude = parseFloat(country?.latitude);
  //     const longitude = parseFloat(country?.longitude);
  //     if (country) {
  //       setLatAndLong([latitude, longitude]);
  //     }
  //   }, [country, setLatAndLong]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popUpRef.current && !popUpRef.current.contains(event.target)) {
        setPopup(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [setPopup]);

  return (
    <>
      {popup !== true ? null : (
        <div className=" absolute inset-0 w-screen h-screen bg-[#0000005c] popup__overlay z-20">
          <div
            ref={popUpRef}
            className="absolute left-[32.5%] right-[32.5%] top-[12%] h-[75vh] popup__container__login w-[35vw] bg-[#ffffff] shadow-2xl rounded-xl overflow-auto"
          >
            {/* pop-up navbar */}
            <div className=" flex items-center w-full py-4 border-b-[1px] px-8 sticky top-0 bg-[#ffffff] z-20">
              <img
                src={closeIcon}
                alt="close icon"
                className="w-8 hover:bg-[#f1f1f1] transition-colors rounded-full p-2 cursor-pointer"
                onClick={() => {
                  setPopup(false);
                }}
              />
              <p className="text-base mx-auto font-semibold text-[#222222]">
                Tell us about your place
              </p>
              <div className="w-[14px]"> </div>
            </div>
            {/* popup body content */}
            <div className=" mt-8 px-8">
              {/* select country input */}
              <div className=" flex flex-col gap-4 text-[#222222]">
                <h6 className="font-medium">Address or area</h6>
                <div className=" flex flex-row items-center gap-5">
                  <img src={location} alt="Location" className=" w-5" />
                  <div>
                    <Select
                      options={Country.getAllCountries()}
                      getOptionLabel={(options) => {
                        return options["name"];
                      }}
                      getOptionValue={(options) => {
                        return options["name"];
                      }}
                      value={country}
                      onChange={(item) => {
                        setCountry(item);
                      }}
                      className=" z-10 min-w-[250px] outline-none border-none"
                      placeholder=" Where's your place?"
                    />
                  </div>
                  {/* <input
                    type="text"
                    className=" focus:outline-none text-base w-full"
                    placeholder="Where's your place?"
                  /> */}
                </div>
              </div>
              <hr className=" h-[1.3px] bg-[#dddddd] my-9" />
              {/* property type */}
              <div className=" flex flex-col gap-6 text-[#222222] my-9">
                <h6 className=" font-medium">Type of space</h6>
                <div className=" bg-[#ebebeb] rounded-full flex flex-row items-center gap-2 p-1  text-sm">
                  <div
                    className={` rounded-full w-full transition-all duration-150 ${
                      isRoomPrivate ? "" : "bg-white"
                    }`}
                  >
                    <button
                      className="p-2 flex justify-center mx-auto"
                      onClick={() => {
                        setIsRoomPrivate(false);
                        setTypeOfRoom("Entire place");
                      }}
                    >
                      Entire place
                    </button>
                  </div>
                  <div
                    className={` rounded-full w-full ${
                      isRoomPrivate ? "bg-white" : ""
                    }`}
                  >
                    <button
                      className="p-2 flex justify-center mx-auto"
                      onClick={() => {
                        setIsRoomPrivate(true);
                        setTypeOfRoom("Private room");
                      }}
                    >
                      Private room
                    </button>
                  </div>
                </div>
              </div>
              <hr className=" h-[1.3px] bg-[#dddddd] my-9" />
              {/* bed rooms */}
              <div
                className={` flex flex-row justify-between items-center text-[#222222] my-9 ${
                  isRoomPrivate
                    ? " pointer-events-none cursor-not-allowed opacity-40"
                    : ""
                }`}
              >
                <h6 className=" font-medium">Bedrooms</h6>
                <div className=" flex flex-row items-center gap-2">
                  <button
                    className=" rounded-full border border-[#dddddd] hover:border-[#717171] cursor-pointer p-2 transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isBedroomsLimitZero}
                    onClick={handleDecrease}
                  >
                    <img src={minus} alt="plus" className="w-4 opacity-40" />
                  </button>
                  {bedrooms}
                  <button
                    className=" rounded-full border border-[#dddddd] hover:border-[#717171] cursor-pointer p-2 transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isBedroomsLimitReached}
                    onClick={handleIncrease}
                  >
                    <img src={plus} alt="plus" className="w-4 opacity-40" />
                  </button>
                </div>
              </div>
              {/* update button footer */}
              <div className=" sticky bottom-0 z-10 bg-white py-4 border-t-[1.3px] border-[#dddddd]">
                <button
                  className=" w-full py-2 rounded-lg font-medium bg-[#222222] hover:bg-[#000000] transition duration-300 text-white text-sm"
                  onClick={handleUpdate}
                >
                  Update your estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default PricingCheckingPopup;
