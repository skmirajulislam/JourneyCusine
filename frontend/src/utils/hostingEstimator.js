import { getCurrencyForCountry, convertPrice, getCurrencySymbol } from "./currency";

// Baseline nightly rate by country (in USD)
export const COUNTRY_BASE_RATES = {
  India: 37,
  "United States": 125,
  "United Kingdom": 110,
  Germany: 95,
  France: 100,
  Italy: 90,
  Spain: 85,
  Canada: 105,
  Australia: 110,
  "United Arab Emirates": 140,
  "Saudi Arabia": 115,
  Singapore: 130,
  Japan: 90,
  Switzerland: 160,
  Netherlands: 115,
  Thailand: 42,
  Vietnam: 35,
  Indonesia: 38,
  Malaysia: 45,
  "New Zealand": 100,
  Brazil: 50,
  Mexico: 55,
  "South Africa": 60,
  Turkey: 50,
  Bangladesh: 30,
  Philippines: 38,
  DEFAULT: 50,
};

// Amenity premiums per night (in USD)
export const ESTIMATOR_AMENITIES = [
  { id: "Pool", label: "Pool", premium: 15, icon: "pool" },
  { id: "Hot tub", label: "Hot tub", premium: 12, icon: "hottub" },
  { id: "Kitchen", label: "Full Kitchen", premium: 8, icon: "kitchen" },
  { id: "Gym", label: "Gym / Fitness", premium: 8, icon: "gym" },
  { id: "Air conditioning", label: "Air conditioning", premium: 6, icon: "ac" },
  { id: "BBQ grill", label: "BBQ Grill", premium: 6, icon: "bbq" },
  { id: "Dedicated workspace", label: "Workspace", premium: 5, icon: "workspace" },
  { id: "Free parking", label: "Free Parking", premium: 5, icon: "parking" },
  { id: "Washer", label: "Washing machine", premium: 4, icon: "washer" },
  { id: "Wifi", label: "High-speed Wifi", premium: 3, icon: "wifi" },
  { id: "TV", label: "Smart TV", premium: 3, icon: "tv" },
];

/**
 * Calculates estimated earning per night in USD
 */
export function calculateNightlyRateUSD({
  countryName = "India",
  typeOfRoom = "Entire place", // "Entire place" | "Private room"
  bedrooms = 0,
  amenities = [],
}) {
  const baseCountryRate = COUNTRY_BASE_RATES[countryName] || COUNTRY_BASE_RATES.DEFAULT;

  // Space type multiplier: Private room has lower base than Entire place
  const spaceMultiplier = typeOfRoom === "Private room" ? 0.55 : 1.0;

  // Bedroom multiplier for Entire place
  let bedroomMultiplier = 1.0;
  if (typeOfRoom === "Entire place") {
    if (bedrooms === 0) bedroomMultiplier = 0.85; // Studio
    else if (bedrooms === 1) bedroomMultiplier = 1.0;
    else if (bedrooms === 2) bedroomMultiplier = 1.45;
    else if (bedrooms === 3) bedroomMultiplier = 1.85;
    else if (bedrooms === 4) bedroomMultiplier = 2.25;
    else bedroomMultiplier = 2.25 + (bedrooms - 4) * 0.35;
  } else {
    // Private room
    bedroomMultiplier = 1.0;
  }

  // Amenities premium addition in USD
  const amenitiesTotalUSD = amenities.reduce((sum, item) => {
    const found = ESTIMATOR_AMENITIES.find((a) => a.id === item);
    return sum + (found ? found.premium : 3);
  }, 0);

  const baseCalculated = Math.round((baseCountryRate * spaceMultiplier * bedroomMultiplier) + amenitiesTotalUSD);
  return Math.max(15, baseCalculated);
}

/**
 * Converts nightly USD rate and total nights into the Host's local currency
 */
export function calculateHostEarnings({
  nights = 1,
  countryName = "India",
  typeOfRoom = "Entire place",
  bedrooms = 0,
  amenities = [],
  hostCurrency = null,
}) {
  const currencyCode = hostCurrency || getCurrencyForCountry(countryName) || "INR";
  const nightlyUSD = calculateNightlyRateUSD({ countryName, typeOfRoom, bedrooms, amenities });
  const totalUSD = nightlyUSD * nights;

  const nightlyLocal = convertPrice(nightlyUSD, currencyCode);
  const totalLocal = convertPrice(totalUSD, currencyCode);
  const symbol = getCurrencySymbol(currencyCode);

  return {
    nightlyUSD,
    totalUSD,
    nightlyLocal,
    totalLocal,
    currencyCode,
    symbol,
    formattedNightly: `${symbol}${nightlyLocal.toLocaleString()}`,
    formattedTotal: `${symbol}${totalLocal.toLocaleString()}`,
  };
}
