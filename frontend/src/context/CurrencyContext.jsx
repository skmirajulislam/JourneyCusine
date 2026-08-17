/* eslint-disable react-refresh/only-export-components */
 
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  CURRENCY_SYMBOLS,
  getCurrencyForCountry,
  convertPrice as convertHelper,
  formatPrice as formatHelper,
  fetchPairRate,
  fetchLiveRatesForBase,
  getDirectRate,
  GLOBAL_COUNTRIES,
  SUPPORTED_CURRENCY_LIST,
  isRazorpaySupportedCurrency,
} from "../utils/currency";

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();

  // Initialize from user details, localStorage, or default to India (INR)
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem("journey_currency");
    if (saved) return saved;
    if (user?.currency) return user.currency;
    if (user?.country) return getCurrencyForCountry(user.country);
    return "INR";
  });

  const [country, setCountryState] = useState(() => {
    const saved = localStorage.getItem("journey_country");
    if (saved) return saved;
    if (user?.country) return user.country;
    return "India";
  });

  // Fetch live direct exchange rates for active user currency from Frankfurter API
  useEffect(() => {
    let isMounted = true;
    fetchLiveRatesForBase(currency).then(() => {
      if (isMounted) {
        // Trigger re-render with updated direct rates cache
        setCurrencyState((curr) => curr);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currency]);

  // Sync currency whenever logged-in user details change
  useEffect(() => {
    if (user?.currency) {
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
    if (newCurrency) {
      setCurrencyState(newCurrency);
      localStorage.setItem("journey_currency", newCurrency);
      fetchLiveRatesForBase(newCurrency);
    }
  };

  const setCountry = (newCountry) => {
    if (newCountry) {
      setCountryState(newCountry);
      localStorage.setItem("journey_country", newCountry);
      const autoCurrency = getCurrencyForCountry(newCountry);
      setCurrencyState(autoCurrency);
      localStorage.setItem("journey_currency", autoCurrency);
      fetchLiveRatesForBase(autoCurrency);
    }
  };

  const refreshRates = useCallback(async () => {
    return await fetchLiveRatesForBase(currency, true);
  }, [currency]);

  const symbol = useMemo(() => {
    return CURRENCY_SYMBOLS[currency] || "$";
  }, [currency]);

  const formatPrice = useCallback((amount, fromCurrency = null, customRate = null) => {
    return formatHelper(amount, currency, fromCurrency || currency, customRate);
  }, [currency]);

  const convertPrice = useCallback((amount, fromCurrency = null, targetCurrency = null, customRate = null) => {
    const from = fromCurrency || currency;
    const to = targetCurrency || currency;
    return convertHelper(amount, from, to, customRate);
  }, [currency]);

  const value = {
    currency,
    setCurrency,
    country,
    setCountry,
    symbol,
    getDirectRate: (from, to) => getDirectRate(from || currency, to || currency),
    fetchPairRate,
    refreshRates,
    formatPrice,
    convertPrice,
    supportedCurrencies: SUPPORTED_CURRENCY_LIST,
    isSupportedByGateway: isRazorpaySupportedCurrency,
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
      getDirectRate: () => 1.0,
      fetchPairRate: async () => 1.0,
      refreshRates: async () => ({ INR: 1.0 }),
      formatPrice: (amount) => formatHelper(amount, "INR", "INR"),
      convertPrice: (amount) => convertHelper(amount, "INR", "INR"),
      setCurrency: () => {},
      setCountry: () => {},
      supportedCurrencies: SUPPORTED_CURRENCY_LIST,
      isSupportedByGateway: isRazorpaySupportedCurrency,
      countriesList: GLOBAL_COUNTRIES,
    };
  }
  return context;
};

export default CurrencyContext;
