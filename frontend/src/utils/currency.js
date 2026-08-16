/**
 * Multi-Currency & Country Mapping Engine (Frontend)
 * Razorpay supports 92+ international currencies.
 * Base Canonical Currency: USD ($)
 */

export const RAZORPAY_SUPPORTED_CURRENCIES = [
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

export const EXCHANGE_RATES = {
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
  PHP: 57.5,
  IDR: 16100.0,
  VND: 25400.0,
};

export const CURRENCY_SYMBOLS = {
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
  PHP: "₱",
  IDR: "Rp",
  VND: "₫",
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
 * Convert price between currencies
 */
export function convertPrice(amountInUSD, targetCurrency = "INR") {
  if (amountInUSD === undefined || amountInUSD === null || isNaN(amountInUSD)) {
    return 0;
  }
  const num = Number(amountInUSD);
  const targetRate = EXCHANGE_RATES[targetCurrency] || 1.0;
  const converted = num * targetRate;

  if (["INR", "JPY", "KRW", "VND", "IDR"].includes(targetCurrency)) {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(currencyCode = "INR") {
  return CURRENCY_SYMBOLS[currencyCode] || "$";
}

/**
 * Format price with dynamic symbol from USD base
 */
export function formatPrice(amountInUSD, targetCurrency = "INR") {
  const symbol = getCurrencySymbol(targetCurrency);
  const converted = convertPrice(amountInUSD, targetCurrency);
  return `${symbol}${converted.toLocaleString()}`;
}

/**
 * Format native amount directly in target currency with symbol
 */
export function formatCurrency(amount, currencyCode = "INR") {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${getCurrencySymbol(currencyCode)}0`;
  }
  const symbol = getCurrencySymbol(currencyCode);
  const num = Math.round(Number(amount));
  return `${symbol}${num.toLocaleString()}`;
}
