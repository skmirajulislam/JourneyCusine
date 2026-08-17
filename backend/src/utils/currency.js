/**
 * Multi-Currency & Country Mapping Utility (Backend)
 * Supports 135+ international currencies via Razorpay and direct Frankfurter API.
 */

// Dynamic Direct Pair Rates Cache (e.g. 'EUR_INR': 110.61, 'GBP_INR': 129.28)
let pairRatesCache = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch direct cross-currency rate between any two currencies from Frankfurter API
 * When fromCurrency === toCurrency, instantly returns 1.0 (No conversion applied).
 */
async function fetchPairRate(fromCurrency = "INR", toCurrency = "INR", force = false) {
  const from = (fromCurrency || "INR").toUpperCase().trim();
  const to = (toCurrency || "INR").toUpperCase().trim();

  // Same country / same currency: 100% exact price, zero conversion
  if (from === to) {
    return 1.0;
  }

  const pairKey = `${from}_${to}`;
  const reverseKey = `${to}_${from}`;

  if (!force && pairRatesCache[pairKey]) {
    return pairRatesCache[pairKey];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.rate === "number") {
        const rate = data.rate;
        pairRatesCache[pairKey] = rate;
        pairRatesCache[reverseKey] = 1 / rate;
        return rate;
      }
    }
  } catch (err) {
    console.warn(`Frankfurter pair rate ${from}->${to} fetch warning:`, err.message);
  }

  return pairRatesCache[pairKey] || 1.0;
}

/**
 * Fetch all exchange rates for a specific base host/guest currency directly from Frankfurter API
 */
async function fetchLiveRatesForBase(baseCurrency = "INR", force = false) {
  const base = (baseCurrency || "INR").toUpperCase().trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://api.frankfurter.dev/v2/rates?base=${encodeURIComponent(base)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const directRates = { [base]: 1.0 };

      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item && item.quote && typeof item.rate === "number") {
            directRates[item.quote] = item.rate;
            pairRatesCache[`${base}_${item.quote}`] = item.rate;
            pairRatesCache[`${item.quote}_${base}`] = 1 / item.rate;
          }
        });
      } else if (data && typeof data.rates === "object") {
        Object.entries(data.rates).forEach(([quote, rate]) => {
          directRates[quote] = rate;
          pairRatesCache[`${base}_${quote}`] = rate;
          pairRatesCache[`${quote}_${base}`] = 1 / rate;
        });
      }

      if (Object.keys(directRates).length > 1) {
        return directRates;
      }
    }
  } catch (err) {
    console.warn(`Frankfurter bulk rates for base ${base} fetch warning:`, err.message);
  }

  return { [base]: 1.0 };
}

/**
 * Synchronously retrieves direct pair exchange rate from cache
 */
function getDirectRate(fromCurrency = "INR", toCurrency = "INR") {
  const from = (fromCurrency || "INR").toUpperCase().trim();
  const to = (toCurrency || "INR").toUpperCase().trim();

  // Same currency: 100% exact price, rate is exactly 1.0
  if (from === to) return 1.0;

  const pairKey = `${from}_${to}`;
  if (pairRatesCache[pairKey]) {
    return pairRatesCache[pairKey];
  }

  const reverseKey = `${to}_${from}`;
  if (pairRatesCache[reverseKey]) {
    return 1 / pairRatesCache[reverseKey];
  }

  return 1.0;
}

// Razorpay supported international currencies (135+ ISO 4217 currencies)
const RAZORPAY_SUPPORTED_CURRENCIES = new Set([
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BWP", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC",
  "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ETB", "EUR", "FJD",
  "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD",
  "HNL", "HTG", "HUF", "IDR", "ILS", "INR", "ISK", "JMD", "JPY", "KES",
  "KGS", "KHR", "KMF", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR",
  "LRD", "LSL", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MUR",
  "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR",
  "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR",
  "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SEK", "SGD", "SHP",
  "SLL", "SOS", "SRD", "STD", "SVC", "SZL", "THB", "TJS", "TOP", "TRY",
  "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VND", "VUV",
  "WST", "XAF", "XCD", "XOF", "XPF", "YER", "ZAR", "ZMW"
]);

// Zero-decimal currencies in Razorpay (multiplier = 1)
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW", "PYG", "RWF",
  "UGX", "VND", "VUV", "XAF", "XOF", "XPF"
]);

function isRazorpaySupportedCurrency(currencyCode) {
  if (!currencyCode) return false;
  return RAZORPAY_SUPPORTED_CURRENCIES.has(String(currencyCode).toUpperCase().trim());
}

function getPaymentCurrency(currencyCode, fallback = "USD") {
  const code = (currencyCode || "INR").toUpperCase().trim();
  return isRazorpaySupportedCurrency(code) ? code : fallback;
}

// Currency Symbols (135+ Currencies)
const CURRENCY_SYMBOLS = {
  AED: "AED", AFN: "؋", ALL: "L", AMD: "֏", ANG: "ƒ", AOA: "Kz", ARS: "$", AUD: "A$",
  AWG: "ƒ", AZN: "₼", BAM: "KM", BBD: "Bds$", BDT: "৳", BGN: "лв", BHD: ".د.ب", BIF: "FBu",
  BMD: "$", BND: "B$", BOB: "Bs.", BRL: "R$", BSD: "B$", BWP: "P", BZD: "BZ$", CAD: "CA$",
  CDF: "FC", CHF: "CHF", CLP: "$", CNY: "¥", COP: "$", CRC: "₡", CVE: "$", CZK: "Kč",
  DJF: "Fdj", DKK: "kr", DOP: "RD$", DZD: "دج", EGP: "E£", ETB: "Br", EUR: "€", FJD: "FJ$",
  FKP: "£", GBP: "£", GEL: "₾", GHS: "GH₵", GIP: "£", GMD: "D", GNF: "FG", GTQ: "Q",
  GYD: "G$", HKD: "HK$", HNL: "L", HTG: "G", HUF: "Ft", IDR: "Rp", ILS: "₪", INR: "₹",
  ISK: "kr", JMD: "J$", JPY: "¥", KES: "KSh", KGS: "с", KHR: "៛", KMF: "CF", KRW: "₩",
  KWD: "KD", KYD: "CI$", KZT: "₸", LAK: "₭", LBP: "L£", LKR: "Rs", LRD: "L$", LSL: "M",
  MAD: "DH", MDL: "L", MGA: "Ar", MKD: "ден", MMK: "K", MNT: "₮", MOP: "MOP$", MUR: "₨",
  MVR: "Rf", MWK: "MK", MXN: "Mex$", MYR: "RM", MZN: "MT", NAD: "N$", NGN: "₦", NIO: "C$",
  NOK: "kr", NPR: "रू", NZD: "NZ$", OMR: "OMR", PAB: "B/.", PEN: "S/.", PGK: "K", PHP: "₱",
  PKR: "₨", PLN: "zł", PYG: "₲", QAR: "QR", RON: "lei", RSD: "din", RUB: "₽", RWF: "FRw",
  SAR: "SAR", SBD: "SI$", SCR: "SR", SEK: "kr", SGD: "S$", SHP: "£", SLL: "Le", SOS: "S",
  SRD: "Sr$", STD: "Db", SVC: "₡", SZL: "E", THB: "฿", TJS: "SM", TOP: "T$", TRY: "₺",
  TTD: "TT$", TWD: "NT$", TZS: "TSh", UAH: "₴", UGX: "USh", USD: "$", UYU: "$U", UZS: "so'm",
  VND: "₫", VUV: "VT", WST: "WS$", XAF: "FCFA", XCD: "EC$", XOF: "CFA", XPF: "₣", YER: "﷼",
  ZAR: "R", ZMW: "ZK"
};

// Comprehensive Country to Currency Mapping
const COUNTRY_TO_CURRENCY = {
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  Germany: "EUR",
  France: "EUR",
  Italy: "EUR",
  Spain: "EUR",
  Netherlands: "EUR",
  Australia: "AUD",
  Canada: "CAD",
  Singapore: "SGD",
  "United Arab Emirates": "AED",
  "Saudi Arabia": "SAR",
  Japan: "JPY",
  Switzerland: "CHF",
  Bangladesh: "BDT",
  Malaysia: "MYR",
  "New Zealand": "NZD",
  Thailand: "THB",
  China: "CNY",
  "Hong Kong": "HKD",
  "South Korea": "KRW",
  Brazil: "BRL",
  Mexico: "MXN",
  "South Africa": "ZAR",
  Turkey: "TRY",
  Sweden: "SEK",
  Norway: "NOK",
  Denmark: "DKK",
  Poland: "PLN",
  Russia: "RUB",
  Philippines: "PHP",
  Indonesia: "IDR",
  Vietnam: "VND",
};

/**
 * Get validated currency for a country.
 */
function getCurrencyForCountry(countryName) {
  if (!countryName) return "INR";
  const trimmed = countryName.trim();
  const rawCurrency = COUNTRY_TO_CURRENCY[trimmed];
  return rawCurrency || "USD";
}

/**
 * Convert price directly from host currency to client currency.
 * - When host and client are from the same country / use same currency: NO conversion, returns exact price.
 * - When host and client are from different countries: Direct cross-currency conversion without USD intermediary.
 */
function convertPrice(amount, fromCurrency = "INR", toCurrency = "INR", customRate = null) {
  if (!amount || isNaN(amount)) return 0;
  const num = Number(amount);
  const from = (fromCurrency || "INR").toUpperCase().trim();
  const to = (toCurrency || "INR").toUpperCase().trim();

  // 1. Same country / same currency: 100% exact price, zero conversion!
  if (from === to) {
    if (ZERO_DECIMAL_CURRENCIES.has(to) || ["IDR", "INR"].includes(to)) {
      return Math.round(num);
    }
    return Math.round(num * 100) / 100;
  }

  // 2. Direct cross-currency conversion
  let rate = 1.0;
  if (typeof customRate === "number" && customRate > 0) {
    rate = customRate;
  } else {
    rate = getDirectRate(from, to);
  }

  const inTarget = num * rate;

  if (ZERO_DECIMAL_CURRENCIES.has(to) || ["IDR", "INR"].includes(to)) {
    return Math.round(inTarget);
  }
  return Math.round(inTarget * 100) / 100;
}

/**
 * Convert amount to smallest currency subunits for Razorpay
 * Zero-decimal currencies (JPY, KRW, VND, CLP, etc.) are passed without 100x multiplier.
 */
function toSubunits(amount, currency = "INR") {
  const code = (currency || "INR").toUpperCase().trim();
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(code);
  if (isZeroDecimal) {
    return Math.max(Math.round(amount), 1);
  }
  return Math.max(Math.round(amount * 100), 100);
}

/**
 * Format currency with symbol
 */
function formatCurrency(amount, currency = "USD") {
  const code = (currency || "USD").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || "$";
  const formattedNum = Number(amount).toLocaleString();
  return `${symbol}${formattedNum}`;
}

module.exports = {
  RAZORPAY_SUPPORTED_CURRENCIES,
  ZERO_DECIMAL_CURRENCIES,
  CURRENCY_SYMBOLS,
  COUNTRY_TO_CURRENCY,
  isRazorpaySupportedCurrency,
  getPaymentCurrency,
  getCurrencyForCountry,
  fetchPairRate,
  fetchLiveRatesForBase,
  getDirectRate,
  convertPrice,
  toSubunits,
  formatCurrency,
};
