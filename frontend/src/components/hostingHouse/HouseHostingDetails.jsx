 
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import search from "../../assets/basicIcon/searchRed.svg";
import PricingCheckingPopup from "../popUp/houseListing/PricingCheckingPopup";
import { calculateHostEarnings } from "../../utils/hostingEstimator";
import { getCurrencyForCountry } from "../../utils/currency";
import { useCurrency } from "../../context/CurrencyContext";

const HouseHostingDetails = ({ setLatAndLong }) => {
  const { user } = useAuth();
  const { currency: globalCurrency } = useCurrency();

  const [perNight, setPerNightChange] = useState(7); // Default to 7 nights for realistic host estimates
  const [isTooltipActive, setActiveTooltip] = useState(false);
  const [showCheckPricePopup, setShowCheckPricePopup] = useState(false);

  // Host location & currency derived from user profile or default
  const defaultCountryName = user?.country || "India";
  const [country, setCountry] = useState({
    name: defaultCountryName,
    latitude: "20.5937",
    longitude: "78.9629",
  });

  // Space type, bedrooms, and amenities for dynamic pricing
  const [bedrooms, setBedrooms] = useState(1);
  const [typeOfRoom, setTypeOfRoom] = useState("Entire place");
  const [selectedAmenities, setSelectedAmenities] = useState([
    "Wifi",
    "Kitchen",
    "Air conditioning",
  ]);

  // Host local currency (prefers user profile currency, derived country currency, or global context)
  const hostCurrency = useMemo(() => {
    if (user?.currency) return user.currency;
    if (country?.name) return getCurrencyForCountry(country.name);
    return globalCurrency || "INR";
  }, [user?.currency, country?.name, globalCurrency]);

  // Dynamic host earnings calculation in host local currency
  const earnings = useMemo(() => {
    return calculateHostEarnings({
      nights: perNight,
      countryName: country?.name || "India",
      typeOfRoom: typeOfRoom,
      bedrooms: bedrooms,
      amenities: selectedAmenities,
      hostCurrency: hostCurrency,
    });
  }, [perNight, country?.name, typeOfRoom, bedrooms, selectedAmenities, hostCurrency]);

  const handlePerNightChange = (e) => {
    setPerNightChange(Number(e.target.value));
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
      <div className="flex flex-col gap-3 md:gap-5 md:mx-6">
        {/* Heading */}
        <div className="flex flex-col gap-2 text-[#222222] dark:text-white font-bold text-2xl md:text-5xl text-center">
          <h1 className="text-[#ff385c]">Motel it.</h1>
          <h1>You could earn</h1>
        </div>

        {/* Amount in Host Local Currency with animated number */}
        <motion.p
          key={`${earnings.formattedTotal}-${earnings.currencyCode}`}
          initial={{ scale: 0.92, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center text-[#222222] dark:text-white font-extrabold text-4xl my-2 md:text-7xl md:my-4 tracking-tight"
        >
          {earnings.formattedTotal}
        </motion.p>

        {/* Description of earning (per night & total nights) */}
        <div className="text-sm md:text-base text-[#222222] dark:text-[#e5e7eb] flex flex-wrap gap-1.5 justify-center items-center h-auto min-h-[24px]">
          <span className="font-bold underline underline-offset-4">
            {perNight} {perNight === 1 ? "night" : "nights"}
          </span>
          <span className="text-neutral-600 dark:text-neutral-300">
            at an estimated <strong className="text-[#ff385c]">{earnings.formattedNightly}</strong> a night
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-semibold">
            {earnings.currencyCode}
          </span>
        </div>

        {/* Slider for nights adjustment */}
        <div
          data-tip={`${perNight} nights`}
          className={`tooltip min-w-[250px] sm:min-w-[300px] md:min-w-[400px] mx-auto w-full max-w-md ${
            isTooltipActive ? "tooltip-open" : ""
          }`}
          onMouseEnter={() => setActiveTooltip(true)}
          onMouseLeave={() => setActiveTooltip(false)}
        >
          <input
            type="range"
            min={1}
            max={30}
            onChange={handlePerNightChange}
            value={perNight}
            className="range range-error accent-[#ff385c] w-full cursor-pointer"
          />
          <div className="w-full flex justify-between text-[11px] px-1 text-neutral-400 font-medium mt-1">
            <span>1 nt</span>
            <span>7 nts</span>
            <span>15 nts</span>
            <span>30 nts</span>
          </div>
        </div>

        {/* Information badge */}
        <p className="text-xs md:text-sm text-[#717171] dark:text-[#a0a0a0] underline font-medium text-center hover:text-[#ff385c] transition-colors cursor-pointer">
          Learn how we estimate your host earnings
        </p>

        {/* Selected places & configuration pill */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-row gap-4 items-center min-w-[280px] sm:min-w-[340px] md:min-w-[400px] rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] shadow-xs hover:shadow-md transition-all mx-auto mt-2 px-6 py-3.5 cursor-pointer"
          onClick={() => {
            setShowCheckPricePopup(true);
          }}
        >
          <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#ff385c] shrink-0">
            <img src={search} alt="search" className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex flex-col text-xs sm:text-sm min-w-0">
            <p className="font-bold text-[#111827] dark:text-white truncate">
              {country ? country.name : "Where's your place?"}
            </p>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs">
              {typeOfRoom} {"•"} {bedrooms === 0 ? "Studio" : `${bedrooms} bed${bedrooms > 1 ? "s" : ""}`}{" "}
              {selectedAmenities.length > 0 && `• ${selectedAmenities.length} amenities`}
            </p>
          </div>
        </motion.div>
      </div>

      {showCheckPricePopup && (
        <PricingCheckingPopup
          popup={showCheckPricePopup}
          setPopup={setShowCheckPricePopup}
          setLatAndLong={setLatAndLong}
          setBedrooms={setBedrooms}
          bedrooms={bedrooms}
          setTypeOfRoom={setTypeOfRoom}
          typeOfRoom={typeOfRoom}
          country={country}
          setCountry={setCountry}
          selectedAmenities={selectedAmenities}
          setSelectedAmenities={setSelectedAmenities}
          hostCurrency={hostCurrency}
        />
      )}
    </>
  );
};

export default HouseHostingDetails;
