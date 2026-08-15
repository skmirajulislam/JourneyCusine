/**
 * Multi-Currency & Country Mapping Utility (Backend)
 * Razorpay supports 92+ international currencies.
 * Canonical base currency: USD ($)
 */

// Razorpay supported international currencies
const RAZORPAY_SUPPORTED_CURRENCIES = new Set([
  "INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED", "JPY", "CHF",
  "MYR", "NZD", "THB", "BDT", "SAR", "QAR", "HKD", "SEK", "NOK", "DKK",
  "PLN", "CZK", "HUF", "ILS", "MXN", "BRL", "ZAR", "PHP", "IDR", "KRW",
  "TRY", "RUB", "TWD", "VND"
]);

// Exchange rates relative to 1 USD
const EXCHANGE_RATES = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.54,
  CAD: 1.36,
  SGD: 1.35,
  AED: 3.67,
  SAR: 3.75,
  JPY: 155.0,
  CHF: 0.90,
  BDT: 118.0,
  MYR: 4.70,
  NZD: 1.65,
  THB: 36.5,
  CNY: 7.23,
  HKD: 7.82,
  KRW: 1370.0,
  BRL: 5.15,
  MXN: 16.9,
  ZAR: 18.5,
  TRY: 32.2,
  SEK: 10.7,
  NOK: 10.8,
  DKK: 6.85,
  PLN: 3.95,
  RUB: 91.5,
  PHP: 57.5,
  IDR: 16100.0,
  VND: 25400.0
};

// Currency Symbols
const CURRENCY_SYMBOLS = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "CA$",
  SGD: "S$",
  AED: "AED",
  SAR: "SAR",
  JPY: "¥",
  CHF: "CHF",
  BDT: "৳",
  MYR: "RM",
  NZD: "NZ$",
  THB: "฿",
  CNY: "¥",
  HKD: "HK$",
  KRW: "₩",
  BRL: "R$",
  MXN: "Mex$",
  ZAR: "R",
  TRY: "₺",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  RUB: "₽",
  PHP: "₱",
  IDR: "Rp",
  VND: "₫"
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
 * If country's currency is supported by Razorpay, returns it; otherwise defaults to USD.
 */
function getCurrencyForCountry(countryName) {
  if (!countryName) return "USD";
  const trimmed = countryName.trim();
  const rawCurrency = COUNTRY_TO_CURRENCY[trimmed] || "USD";
  return RAZORPAY_SUPPORTED_CURRENCIES.has(rawCurrency) ? rawCurrency : "USD";
}

/**
 * Convert price from one currency to another
 */
function convertPrice(amount, fromCurrency = "USD", toCurrency = "USD") {
  if (!amount || isNaN(amount)) return 0;
  const num = Number(amount);
  if (fromCurrency === toCurrency) return Math.round(num);

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1.0;
  const toRate = EXCHANGE_RATES[toCurrency] || 1.0;

  // Convert to USD first, then to target currency
  const inUSD = num / fromRate;
  const inTarget = inUSD * toRate;

  // Zero-decimal currencies like JPY, KRW, VND rounded to whole numbers
  if (["JPY", "KRW", "VND", "IDR", "INR"].includes(toCurrency)) {
    return Math.round(inTarget);
  }
  return Math.round(inTarget * 100) / 100;
}

/**
 * Convert amount to smallest currency subunits (paise for INR, cents for USD)
 * Note: JPY, KRW, VND are zero-decimal currencies in Razorpay
 */
function toSubunits(amount, currency = "INR") {
  const zeroDecimal = ["JPY", "KRW", "VND", "IDR"].includes(currency.toUpperCase());
  if (zeroDecimal) {
    return Math.max(Math.round(amount), 1);
  }
  return Math.max(Math.round(amount * 100), 100);
}

/**
 * Format currency with symbol
 */
function formatCurrency(amount, currency = "USD") {
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  const formattedNum = Number(amount).toLocaleString();
  return `${symbol}${formattedNum}`;
}

module.exports = {
  RAZORPAY_SUPPORTED_CURRENCIES,
  EXCHANGE_RATES,
  CURRENCY_SYMBOLS,
  COUNTRY_TO_CURRENCY,
  getCurrencyForCountry,
  convertPrice,
  toSubunits,
  formatCurrency,
};
