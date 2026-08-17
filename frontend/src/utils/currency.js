/**
 * Multi-Currency & Country Mapping Engine (Frontend)
 * Razorpay supports 92+ international currencies.
 * Base Canonical Currency: USD ($)
 */

export const SUPPORTED_CURRENCY_LIST = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "India" },
  { code: "USD", name: "US Dollar", symbol: "$", country: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", country: "Germany" },
  { code: "GBP", name: "British Pound", symbol: "£", country: "United Kingdom" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", country: "Australia" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", country: "Canada" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", country: "Singapore" },
  { code: "AED", name: "UAE Dirham", symbol: "AED", country: "United Arab Emirates" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", country: "Saudi Arabia" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "Japan" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", country: "Switzerland" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", country: "Bangladesh" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", country: "Malaysia" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", country: "New Zealand" },
  { code: "THB", name: "Thai Baht", symbol: "฿", country: "Thailand" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "China" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", country: "Hong Kong" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", country: "South Korea" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "Brazil" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", country: "Mexico" },
  { code: "ZAR", name: "South African Rand", symbol: "R", country: "South Africa" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", country: "Turkey" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", country: "Sweden" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", country: "Norway" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", country: "Denmark" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", country: "Poland" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", country: "Philippines" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", country: "Indonesia" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", country: "Vietnam" },
];

// Dynamic Direct Pair Rates Cache (e.g. 'EUR_INR': 110.61, 'GBP_INR': 129.28)
let pairRatesCache = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch direct cross-currency rate between any two currencies (e.g. EUR to INR, GBP to EUR)
 * When fromCurrency === toCurrency, instantly returns 1.0 (No conversion applied).
 */
export async function fetchPairRate(fromCurrency = "INR", toCurrency = "INR", force = false) {
  const from = (fromCurrency || "INR").toUpperCase().trim();
  const to = (toCurrency || "INR").toUpperCase().trim();

  // Same currency / same country: 100% exact price, no conversion
  if (from === to) {
    return 1.0;
  }

  const pairKey = `${from}_${to}`;
  const reverseKey = `${to}_${from}`;
  const CACHE_KEY = `journey_pair_rate_${pairKey}`;
  const CACHE_TIME_KEY = `journey_pair_time_${pairKey}`;

  if (!force && typeof window !== "undefined") {
    try {
      const savedTime = localStorage.getItem(CACHE_TIME_KEY);
      const savedRate = localStorage.getItem(CACHE_KEY);
      if (savedTime && savedRate && Date.now() - Number(savedTime) < CACHE_TTL_MS) {
        const rate = Number(savedRate);
        if (!isNaN(rate) && rate > 0) {
          pairRatesCache[pairKey] = rate;
          pairRatesCache[reverseKey] = 1 / rate;
          return rate;
        }
      }
    } catch {
      // ignore localStorage parse error
    }
  }

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

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, String(rate));
            localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
          } catch {
            // ignore storage quota error
          }
        }
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
export async function fetchLiveRatesForBase(baseCurrency = "INR", force = false) {
  const base = (baseCurrency || "INR").toUpperCase().trim();
  const CACHE_KEY = `journey_rates_base_${base}`;
  const CACHE_TIME_KEY = `journey_rates_time_${base}`;

  if (!force && typeof window !== "undefined") {
    try {
      const savedTime = localStorage.getItem(CACHE_TIME_KEY);
      const savedRates = localStorage.getItem(CACHE_KEY);
      if (savedTime && savedRates && Date.now() - Number(savedTime) < CACHE_TTL_MS) {
        const parsed = JSON.parse(savedRates);
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([quote, rate]) => {
            pairRatesCache[`${base}_${quote}`] = rate;
            pairRatesCache[`${quote}_${base}`] = 1 / rate;
          });
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

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
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(directRates));
            localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
          } catch {
            // ignore
          }
        }
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
export function getDirectRate(fromCurrency = "INR", toCurrency = "INR") {
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

export const RAZORPAY_SUPPORTED_CURRENCIES = new Set([
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

// Currencies where Razorpay requires single unit (no 100x subunit multiplier)
export const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW", "PYG", "RWF",
  "UGX", "VND", "VUV", "XAF", "XOF", "XPF"
]);

export function isRazorpaySupportedCurrency(currencyCode) {
  if (!currencyCode) return false;
  return RAZORPAY_SUPPORTED_CURRENCIES.has(String(currencyCode).toUpperCase().trim());
}

export function getPaymentCurrency(currencyCode, fallback = "USD") {
  const code = (currencyCode || "INR").toUpperCase().trim();
  return isRazorpaySupportedCurrency(code) ? code : fallback;
}

export const CURRENCY_SYMBOLS = {
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

export const COUNTRY_TO_CURRENCY = {
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
  Philippines: "PHP",
  Indonesia: "IDR",
  Vietnam: "VND",
};

export const COUNTRY_PHONE_DATA = [
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", currency: "INR", symbol: "₹" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", currency: "USD", symbol: "$" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", currency: "GBP", symbol: "£" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", currency: "CAD", symbol: "CA$" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", currency: "AUD", symbol: "A$" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", currency: "AED", symbol: "AED" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", currency: "SAR", symbol: "SAR" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", currency: "SGD", symbol: "S$" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", currency: "EUR", symbol: "€" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", currency: "EUR", symbol: "€" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", currency: "EUR", symbol: "€" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", currency: "EUR", symbol: "€" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱", currency: "EUR", symbol: "€" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", currency: "JPY", symbol: "¥" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩", currency: "BDT", symbol: "৳" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭", currency: "THB", symbol: "฿" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", currency: "MYR", symbol: "RM" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿", currency: "NZD", symbol: "NZ$" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭", currency: "CHF", symbol: "CHF" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", currency: "CNY", symbol: "¥" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰", currency: "HKD", symbol: "HK$" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷", currency: "KRW", symbol: "₩" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", currency: "BRL", symbol: "R$" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽", currency: "MXN", symbol: "Mex$" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦", currency: "ZAR", symbol: "R" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", currency: "TRY", symbol: "₺" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪", currency: "SEK", symbol: "kr" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴", currency: "NOK", symbol: "kr" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰", currency: "DKK", symbol: "kr" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱", currency: "PLN", symbol: "zł" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭", currency: "PHP", symbol: "₱" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩", currency: "IDR", symbol: "Rp" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳", currency: "VND", symbol: "₫" },
];

export const GLOBAL_COUNTRIES = COUNTRY_PHONE_DATA.map((c) => c.name);

/**
 * Get validated currency for a country
 */
export function getCurrencyForCountry(countryName) {
  if (!countryName) return "INR";
  const trimmed = countryName.trim();
  const matched = COUNTRY_TO_CURRENCY[trimmed];
  return matched || "USD";
}

/**
 * Convert price directly between host currency and client currency.
 * - When host and client use the same currency / country (from === to): NO conversion is performed, exact actual price is returned.
 * - When host and client use different currencies: Direct cross-currency conversion via Frankfurter API rate (No USD intermediary).
 */
export function convertPrice(amount, arg2 = null, arg3 = null, customRate = null) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 0;
  }
  const num = Number(amount);

  let fromCurrency = "INR";
  let targetCurrency = "INR";

  if (arg3 && typeof arg3 === "string") {
    // Called as convertPrice(amount, fromHostCurrency, toClientCurrency)
    fromCurrency = (arg2 || "INR").toUpperCase().trim();
    targetCurrency = (arg3 || "INR").toUpperCase().trim();
  } else if (arg2 && typeof arg2 === "string") {
    // Called as convertPrice(amount, targetCurrency) -> defaults fromCurrency to targetCurrency (exact native price)
    fromCurrency = arg2.toUpperCase().trim();
    targetCurrency = arg2.toUpperCase().trim();
  } else {
    fromCurrency = "INR";
    targetCurrency = "INR";
  }

  // 1. Same country / same currency check: 100% exact price, zero conversion!
  if (fromCurrency === targetCurrency) {
    if (["INR", "JPY", "KRW", "VND", "IDR"].includes(targetCurrency)) {
      return Math.round(num);
    }
    return Math.round(num * 100) / 100;
  }

  // 2. Direct cross-currency conversion
  let rate = 1.0;
  if (typeof customRate === "number" && customRate > 0) {
    rate = customRate;
  } else {
    rate = getDirectRate(fromCurrency, targetCurrency);
  }

  const converted = num * rate;

  if (["INR", "JPY", "KRW", "VND", "IDR"].includes(targetCurrency)) {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(currencyCode = "INR") {
  const code = (currencyCode || "INR").toUpperCase().trim();
  return CURRENCY_SYMBOLS[code] || "$";
}

/**
 * Format price directly in target client currency.
 * If fromCurrency is not provided, defaults to targetCurrency (i.e. native price format without conversion).
 * If fromCurrency is provided and fromCurrency !== targetCurrency, converts from fromCurrency to targetCurrency.
 */
export function formatPrice(amount, targetCurrency = "INR", fromCurrency = null, customRate = null) {
  const toCode = (targetCurrency || "INR").toUpperCase().trim();
  const fromCode = fromCurrency ? fromCurrency.toUpperCase().trim() : toCode;
  const symbol = getCurrencySymbol(toCode);
  const converted = convertPrice(amount, fromCode, toCode, customRate);
  return `${symbol}${converted.toLocaleString()}`;
}

/**
 * Format native amount directly in target currency with symbol
 */
export function formatCurrency(amount, currencyCode = "INR") {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${getCurrencySymbol(currencyCode)}0`;
  }
  const code = (currencyCode || "INR").toUpperCase().trim();
  const symbol = getCurrencySymbol(code);
  const num = Math.round(Number(amount));
  return `${symbol}${num.toLocaleString()}`;
}

/**
 * Convert amount to smallest currency subunits for Razorpay
 * Zero-decimal currencies (JPY, KRW, VND, CLP, etc.) are passed without 100x multiplier.
 */
export function toSubunits(amount, currency = "INR") {
  const code = (currency || "INR").toUpperCase().trim();
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(code);
  if (isZeroDecimal) {
    return Math.max(Math.round(amount), 1);
  }
  const minSubunits = ["BDT", "PHP", "THB", "PKR", "NPR", "LKR"].includes(code) ? 500 : 100;
  return Math.max(Math.round(amount * 100), minSubunits);
}

