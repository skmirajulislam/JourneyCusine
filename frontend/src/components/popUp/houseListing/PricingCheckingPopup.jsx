/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { Country } from "country-state-city";
import Select from "react-select";
import { FiX, FiMapPin } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

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
    if (country && !isNaN(latitude) && !isNaN(longitude)) {
      setLatAndLong([latitude, longitude]);
    }
    setPopup(false);
  };

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

  if (!popup) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={popUpRef}
        className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col"
      >
        {/* Pop-up header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-[#1e1e1e] z-20">
          <button
            type="button"
            onClick={() => setPopup(false)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
          <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white">
            Tell us about your place
          </h3>
          <div className="w-8" />
        </div>

        {/* Pop-up body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Address / Country input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
              Address or area
            </label>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[#ff385c] shrink-0">
                <FiMapPin size={18} />
              </div>
              <div className="flex-1">
                <Select
                  options={Country.getAllCountries()}
                  getOptionLabel={(options) => options["name"]}
                  getOptionValue={(options) => options["name"]}
                  value={country}
                  onChange={(item) => setCountry(item)}
                  className="react-select-container text-sm"
                  classNamePrefix="react-select"
                  placeholder="Where's your place?"
                  isClearable
                />
              </div>
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Type of space toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
              Type of space
            </label>
            <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl grid grid-cols-2 gap-1">
              <button
                type="button"
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                  !isRoomPrivate
                    ? "bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                }`}
                onClick={() => {
                  setIsRoomPrivate(false);
                  setTypeOfRoom("Entire place");
                }}
              >
                Entire place
              </button>
              <button
                type="button"
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                  isRoomPrivate
                    ? "bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                }`}
                onClick={() => {
                  setIsRoomPrivate(true);
                  setTypeOfRoom("Private room");
                }}
              >
                Private room
              </button>
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Bedrooms Counter */}
          <div
            className={`flex items-center justify-between transition-opacity ${
              isRoomPrivate ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <div>
              <p className="text-sm font-bold text-[#111827] dark:text-white">
                Bedrooms
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Number of bedrooms for guests
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-9 h-9 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                disabled={isBedroomsLimitZero}
                onClick={handleDecrease}
                aria-label="Decrease bedrooms"
              >
                <AiOutlineMinus size={14} />
              </button>
              <span className="text-base font-bold text-[#111827] dark:text-white w-6 text-center">
                {bedrooms}
              </span>
              <button
                type="button"
                className="w-9 h-9 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                disabled={isBedroomsLimitReached}
                onClick={handleIncrease}
                aria-label="Increase bedrooms"
              >
                <AiOutlinePlus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Update Button */}
        <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 sticky bottom-0 bg-white dark:bg-[#1e1e1e] z-20">
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
            onClick={handleUpdate}
          >
            Update your estimate
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingCheckingPopup;
