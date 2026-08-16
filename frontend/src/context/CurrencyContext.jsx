/* eslint-disable react-refresh/only-export-components */
 
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  CURRENCY_SYMBOLS,
  EXCHANGE_RATES,
  getCurrencyForCountry,
  convertPrice as convertHelper,
  formatPrice as formatHelper,
  GLOBAL_COUNTRIES,
  RAZORPAY_SUPPORTED_CURRENCIES,
} from "../utils/currency";

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();

  // Initialize from user details, localStorage, or default to India (INR)
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem("journey_currency");
    if (saved && EXCHANGE_RATES[saved]) return saved;
    if (user?.currency && EXCHANGE_RATES[user.currency]) return user.currency;
    if (user?.country) return getCurrencyForCountry(user.country);
    return "INR";
  });

  const [country, setCountryState] = useState(() => {
    const saved = localStorage.getItem("journey_country");
    if (saved) return saved;
    if (user?.country) return user.country;
    return "India";
  });

  // Sync currency whenever logged-in user details change
  useEffect(() => {
    if (user?.currency && EXCHANGE_RATES[user.currency]) {
      setCurrencyState(user.currency);
      localStorage.setItem("journey_currency", user.currency);
    } else if (user?.country) {
      const derived = getCurrencyForCountry(user.country);
      setCurrencyState(derived);
      localStorage.setItem("journey_currency", derived);
    }

    if (user?.country) {
      setCountryState(user.country);
      localStorage.setItem("journey_country", user.country);
    }
  }, [user?.currency, user?.country]);

  const setCurrency = (newCurrency) => {
    if (newCurrency && EXCHANGE_RATES[newCurrency]) {
      setCurrencyState(newCurrency);
      localStorage.setItem("journey_currency", newCurrency);
    }
  };

  const setCountry = (newCountry) => {
    if (newCountry) {
      setCountryState(newCountry);
      localStorage.setItem("journey_country", newCountry);
      const autoCurrency = getCurrencyForCountry(newCountry);
      setCurrencyState(autoCurrency);
      localStorage.setItem("journey_currency", autoCurrency);
    }
  };

  const symbol = useMemo(() => {
    return CURRENCY_SYMBOLS[currency] || "$";
  }, [currency]);

  const formatPrice = (amountInUSD) => {
    return formatHelper(amountInUSD, currency);
  };

  const convertPrice = (amountInUSD) => {
    return convertHelper(amountInUSD, currency);
  };

  const value = {
    currency,
    setCurrency,
    country,
    setCountry,
    symbol,
    exchangeRate: EXCHANGE_RATES[currency] || 1.0,
    formatPrice,
    convertPrice,
    supportedCurrencies: RAZORPAY_SUPPORTED_CURRENCIES,
    countriesList: GLOBAL_COUNTRIES,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "INR",
      symbol: "₹",
      country: "India",
      exchangeRate: 83.5,
      formatPrice: (amount) => formatHelper(amount, "INR"),
      convertPrice: (amount) => convertHelper(amount, "INR"),
      setCurrency: () => {},
      setCountry: () => {},
      supportedCurrencies: RAZORPAY_SUPPORTED_CURRENCIES,
      countriesList: GLOBAL_COUNTRIES,
    };
  }
  return context;
};

export default CurrencyContext;
