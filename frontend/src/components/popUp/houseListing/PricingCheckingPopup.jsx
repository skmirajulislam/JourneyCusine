 
import { useCallback, useEffect, useRef, useState } from "react";
import { Country } from "country-state-city";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMapPin, FiCheck } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { HiOutlineWifi } from "react-icons/hi";
import { PiTelevisionSimple } from "react-icons/pi";
import { MdOutlineKitchen, MdOutlinePool } from "react-icons/md";
import { BiSolidWasher } from "react-icons/bi";
import { AiOutlineCar } from "react-icons/ai";
import { BsSnow, BsPersonWorkspace } from "react-icons/bs";
import { GiBathtub, GiBarbecue } from "react-icons/gi";
import { CiDumbbell } from "react-icons/ci";
import { ESTIMATOR_AMENITIES, calculateHostEarnings } from "../../../utils/hostingEstimator";
import { getCurrencyForCountry, convertPrice, getCurrencySymbol } from "../../../utils/currency";

const AMENITY_ICONS = {
  Pool: MdOutlinePool,
  "Hot tub": GiBathtub,
  Kitchen: MdOutlineKitchen,
  Gym: CiDumbbell,
  "Air conditioning": BsSnow,
  "BBQ grill": GiBarbecue,
  "Dedicated workspace": BsPersonWorkspace,
  "Free parking": AiOutlineCar,
  Washer: BiSolidWasher,
  Wifi: HiOutlineWifi,
  TV: PiTelevisionSimple,
};

const PricingCheckingPopup = ({
  popup,
  setPopup,
  setLatAndLong,
  setBedrooms,
  bedrooms,
  setTypeOfRoom,
  typeOfRoom,
  country,
  setCountry,
  selectedAmenities = [],
  setSelectedAmenities,
  hostCurrency,
}) => {
  const popUpRef = useRef(null);
  const [localRoomType, setLocalRoomType] = useState(typeOfRoom || "Entire place");
  const [localBedrooms, setLocalBedrooms] = useState(bedrooms || 0);
  const [localAmenities, setLocalAmenities] = useState(selectedAmenities || []);
  const [localCountry, setLocalCountry] = useState(country);

  // Sync state when popup opens
  useEffect(() => {
    if (popup) {
      setLocalRoomType(typeOfRoom || "Entire place");
      setLocalBedrooms(bedrooms || 0);
      setLocalAmenities(selectedAmenities || []);
      setLocalCountry(country);
    }
  }, [popup, typeOfRoom, bedrooms, selectedAmenities, country]);

  const activeCountryName = localCountry?.name || country?.name || "India";
  const activeCurrency = hostCurrency || getCurrencyForCountry(activeCountryName) || "INR";
  const currencySymbol = getCurrencySymbol(activeCurrency);

  // Live preview calculation inside popup
  const previewEarnings = calculateHostEarnings({
    nights: 1,
    countryName: activeCountryName,
    typeOfRoom: localRoomType,
    bedrooms: localBedrooms,
    amenities: localAmenities,
    hostCurrency: activeCurrency,
  });

  const handleIncrease = useCallback(() => {
    if (localBedrooms < 8) {
      setLocalBedrooms((prev) => prev + 1);
    }
  }, [localBedrooms]);

  const handleDecrease = useCallback(() => {
    if (localBedrooms > 0) {
      setLocalBedrooms((prev) => prev - 1);
    }
  }, [localBedrooms]);

  const handleToggleAmenity = (amenityId) => {
    setLocalAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleUpdate = () => {
    setTypeOfRoom(localRoomType);
    setBedrooms(localBedrooms);
    if (setSelectedAmenities) setSelectedAmenities(localAmenities);
    if (setCountry && localCountry) setCountry(localCountry);

    const latitude = parseFloat(localCountry?.latitude);
    const longitude = parseFloat(localCountry?.longitude);
    if (localCountry && !isNaN(latitude) && !isNaN(longitude)) {
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
    <AnimatePresence>
      {popup && (
        <div className="fixed inset-0 w-full h-full bg-black/65 backdrop-blur-sm z-[110] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
          <motion.div
            ref={popUpRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-lg md:max-w-xl w-full max-h-[80vh] sm:max-h-[78vh] overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col my-auto"
          >
            {/* Pop-up header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-[#1e1e1e] z-20 shrink-0">
              <button
                type="button"
                onClick={() => setPopup(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
              <div className="text-center">
                <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-white">
                  Tell us about your place
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
                  Customize space &amp; amenities for dynamic host earnings
                </p>
              </div>
              <div className="w-8" />
            </div>

            {/* Pop-up body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Address / Country input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Country or Region
                </label>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#ff385c] shrink-0">
                    <FiMapPin size={18} />
                  </div>
                  <div className="flex-1">
                    <Select
                      options={Country.getAllCountries()}
                      getOptionLabel={(options) => options["name"]}
                      getOptionValue={(options) => options["name"]}
                      value={localCountry}
                      onChange={(item) => setLocalCountry(item)}
                      className="react-select-container text-sm"
                      classNamePrefix="react-select"
                      placeholder="Where's your place located?"
                      isClearable
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 ml-1">
                  Local currency: <strong className="text-[#111827] dark:text-white">{activeCurrency} ({currencySymbol})</strong> based on host profile.
                </p>
              </div>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Type of space toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                    Type of Space
                  </label>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {localRoomType === "Entire place" ? "Higher earning potential" : "Shared home"}
                  </span>
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                      localRoomType === "Entire place"
                        ? "bg-white dark:bg-[#2a2a2a] text-[#ff385c] dark:text-white shadow-sm ring-1 ring-[#ff385c]/20"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                    onClick={() => setLocalRoomType("Entire place")}
                  >
                    Entire place
                  </button>
                  <button
                    type="button"
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                      localRoomType === "Private room"
                        ? "bg-white dark:bg-[#2a2a2a] text-[#ff385c] dark:text-white shadow-sm ring-1 ring-[#ff385c]/20"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                    onClick={() => setLocalRoomType("Private room")}
                  >
                    Private room
                  </button>
                </div>
              </div>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Bedrooms Counter */}
              <div
                className={`flex items-center justify-between transition-opacity ${
                  localRoomType === "Private room" ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-[#111827] dark:text-white">
                    Bedrooms
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {localBedrooms === 0 ? "Studio apartment" : `${localBedrooms} dedicated bedroom${localBedrooms > 1 ? "s" : ""}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    disabled={localBedrooms === 0}
                    onClick={handleDecrease}
                    aria-label="Decrease bedrooms"
                  >
                    <AiOutlineMinus size={13} />
                  </button>
                  <span className="text-sm sm:text-base font-bold text-[#111827] dark:text-white w-5 text-center">
                    {localBedrooms}
                  </span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    disabled={localBedrooms >= 8}
                    onClick={handleIncrease}
                    aria-label="Increase bedrooms"
                  >
                    <AiOutlinePlus size={13} />
                  </button>
                </div>
              </div>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Amenities Multi-Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                    Amenities &amp; Features (Boosts Value)
                  </label>
                  <span className="text-[11px] font-semibold text-[#ff385c]">
                    {localAmenities.length} selected
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2.5">
                  Premium amenities increase your average nightly earnings.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ESTIMATOR_AMENITIES.map((amenity) => {
                    const isSelected = localAmenities.includes(amenity.id);
                    const IconComponent = AMENITY_ICONS[amenity.id] || MdOutlinePool;
                    const localBonus = convertPrice(amenity.premium, activeCurrency);

                    return (
                      <button
                        type="button"
                        key={amenity.id}
                        onClick={() => handleToggleAmenity(amenity.id)}
                        className={`flex flex-col items-start justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#ff385c] bg-[#ff385c]/5 dark:bg-[#ff385c]/15 text-[#111827] dark:text-white font-bold ring-1.5 ring-[#ff385c]"
                            : "border-[#e5e7eb] dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-[#374151] dark:text-[#d1d5db]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <IconComponent
                            size={16}
                            className={isSelected ? "text-[#ff385c]" : "text-neutral-500"}
                          />
                          <div
                            className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#ff385c] text-white"
                                : "border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                            }`}
                          >
                            {isSelected && <FiCheck size={10} />}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold block leading-tight">{amenity.label}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            +{currencySymbol}{localBonus.toLocaleString()}/nt
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer with Live Calculated Preview & Update Button */}
            <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 sticky bottom-0 bg-white dark:bg-[#1e1e1e] z-20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                  Estimated Host Earning:
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-[#ff385c]">
                  {previewEarnings.formattedNightly}{" "}
                  <span className="text-xs font-normal text-neutral-600 dark:text-neutral-400">/ night</span>
                </span>
              </div>
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                onClick={handleUpdate}
              >
                Update your estimate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PricingCheckingPopup;
