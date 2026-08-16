 
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import errorIcon from "../../../assets/basicIcon/errorIcon.png";
import { API } from "../../../backend";
import { useAuth } from "../../../hooks/useAuth";
import { useCurrency } from "../../../context/CurrencyContext";
import { COUNTRY_PHONE_DATA } from "../../../utils/currency";

const CreateUserPopup = ({
  loginEmail,
  setProfilePopup,
  showCreatePopUp,
  setPopup,
}) => {
  const [inputDateFocused, setInputDateFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const { country: activeCountry, setCountry, setCurrency } = useCurrency();

  const [selectedCountryObj, setSelectedCountryObj] = useState(() => {
    return (
      COUNTRY_PHONE_DATA.find((c) => c.name === activeCountry) ||
      COUNTRY_PHONE_DATA[0]
    );
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { setUser } = useAuth();

  const handleCountryChange = (e) => {
    const found = COUNTRY_PHONE_DATA.find((c) => c.name === e.target.value);
    if (found) {
      setSelectedCountryObj(found);
      setCountry(found.name);
      setCurrency(found.currency);
    }
  };

  const handleDateFocus = () => {
    setInputDateFocused(true);
  };

  const handleDateBlur = () => {
    setInputDateFocused(false);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleCreateUser = async (data) => {
    if (!acceptedTerms) {
      setTermsError(true);
      toast.error("Please accept the Terms & Community Guidelines to register.");
      return;
    }
    setTermsError(false);

    let user = {
      name: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      emailId: data.email,
      birthDate: data.birthDate,
      password: data.password,
      country: selectedCountryObj.name,
      countryCode: selectedCountryObj.code,
      currency: selectedCountryObj.currency,
      phoneNumber: {
        dialCode: selectedCountryObj.dialCode,
        number: data.phone || "",
        fullNumber: `${selectedCountryObj.dialCode} ${data.phone || ""}`.trim(),
      },
    };
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}auth/sign_up`, user, {
        headers: { "Content-Type": "application/json" },
      });

      const responseData = response?.data;
      setUser(responseData);
      
      // Update global currency context to user's registered country and currency
      setCountry(selectedCountryObj.name);
      setCurrency(selectedCountryObj.currency);

      if (responseData?.success === 1) {
        toast.success(responseData.info || "Welcome to Journey Cuisine! You are now logged in.");
        if (responseData?.accessToken) {
          localStorage.setItem("accessToken", JSON.stringify(responseData.accessToken));
        }
        if (responseData?.refreshToken) {
          localStorage.setItem("refreshToken", JSON.stringify(responseData.refreshToken));
        }
        
        // Immediately sync user in auth state
        setUser(responseData);

        // Close all authentication popups so user directly enters the app
        showCreatePopUp(false);
        setProfilePopup(false);
        setPopup(false);
      }
      reset();
    } catch (error) {
      console.log(error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.error("Network error try again later!");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-5 pt-1.5 px-4 sm:px-6">
      <form
        onSubmit={handleSubmit(handleCreateUser)}
        className="flex flex-col gap-3"
      >
        {/* Country / Region Selector */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Country / Region &amp; Currency
          </label>
          <div className="relative">
            <select
              value={selectedCountryObj.name}
              onChange={handleCountryChange}
              className="w-full border-[1.5px] border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-neutral-800 dark:text-neutral-100 p-2.5 sm:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c] text-xs sm:text-sm font-medium cursor-pointer shadow-2xs"
            >
              {COUNTRY_PHONE_DATA.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name} ({c.currency} - {c.symbol})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>
              Prices will display in:{" "}
              <strong className="text-[#ff385c]">
                {selectedCountryObj.currency} ({selectedCountryObj.symbol})
              </strong>
            </span>
          </div>
        </div>

        {/* First & Last Name (2 columns on mobile/tablet/desktop) */}
        <div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <input
                type="text"
                className="w-full border-[1.5px] border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 p-2.5 sm:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c] text-xs sm:text-sm"
                placeholder="First name"
                {...register("firstName", { required: true, maxLength: 40 })}
                aria-invalid={errors.firstName ? "true" : "false"}
              />
            </div>
            <div>
              <input
                type="text"
                className="w-full border-[1.5px] border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 p-2.5 sm:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c] text-xs sm:text-sm"
                placeholder="Last name"
                {...register("lastName", { required: true, maxLength: 40 })}
                aria-invalid={errors.lastName ? "true" : "false"}
              />
            </div>
          </div>
          {(errors.firstName || errors.lastName) && (
            <div role="alert" className="flex flex-row items-center gap-1.5 mt-1">
              <img src={errorIcon} alt="Name is required" className="w-3.5 h-3.5" />
              <p className="text-[11px] text-[#c13515]">Full name is required as per government ID</p>
            </div>
          )}
          {!errors.firstName && !errors.lastName && (
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
              Make sure it matches the name on your government ID.
            </p>
          )}
        </div>

        {/* Mobile Number Field */}
        <div>
          <div className="flex gap-2">
            <div className="px-3 py-2.5 sm:py-3 rounded-xl border-[1.5px] border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#333333] text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0">
              <span>{selectedCountryObj.flag}</span>
              <span>{selectedCountryObj.dialCode}</span>
            </div>
            <input
              type="tel"
              className="flex-1 border-[1.5px] border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 p-2.5 sm:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c] text-xs sm:text-sm"
              placeholder="Mobile phone number"
              {...register("phone", {
                required: "Mobile phone number is required",
                pattern: {
                  value: /^[0-9]{7,15}$/,
                  message: "Enter a valid phone number (7-15 digits)",
                },
              })}
              aria-invalid={errors.phone ? "true" : "false"}
            />
          </div>
          {errors.phone && (
            <div role="alert" className="flex flex-row items-center gap-1.5 mt-1">
              <img src={errorIcon} alt="Phone is required" className="w-3.5 h-3.5" />
              <p className="text-[11px] text-[#c13515]">
                {errors.phone.message || "Valid mobile number is required"}
              </p>
            </div>
          )}
        </div>

        {/* Birthdate */}
        <div>
          <input
            className="w-full border-[1.5px] border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 p-2.5 sm:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c] text-xs sm:text-sm"
            type={`${inputDateFocused ? "date" : "text"}`}
            aria-invalid={errors.birthDate ? "true" : "false"}
            placeholder="Birthdate (YYYY-MM-DD)"
            onFocus={handleDateFocus}
            onBlur={handleDateBlur}
            {...register("birthDate", {
              required: true,
              onBlur: handleDateBlur,
            })}
          />
          {errors.birthDate && (
            <div role="alert" className="flex flex-row items-center gap-1.5 mt-1">
              <img src={errorIcon} alt="Birthdate is required" className="w-3.5 h-3.5" />
              <p className="text-[11px] text-[#c13515]">Birth date is required (Must be 18+)</p>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            className="w-full border-[1.5px] border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 p-2.5 sm:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c] text-xs sm:text-sm"
            type="email"
            defaultValue={loginEmail}
            placeholder="Email address"
            {...register("email", { required: true })}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <div role="alert" className="flex flex-row items-center gap-1.5 mt-1">
              <img src={errorIcon} alt="Email is required" className="w-3.5 h-3.5" />
              <p className="text-[11px] text-[#c13515]">Valid email is required</p>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password (at least 8 characters)"
            className="w-full border-[1.5px] border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 p-2.5 sm:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c] text-xs sm:text-sm pr-16"
            {...register("password", {
              required: true,
              pattern: /^(?=.*[a-z]).{8,}$/,
            })}
          />
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 right-3 text-neutral-700 dark:text-neutral-300 text-xs font-bold underline cursor-pointer p-1"
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? "Hide" : "Show"}
          </button>
          {errors.password && (
            <div role="alert" className="flex flex-row items-center gap-1.5 mt-1">
              <img src={errorIcon} alt="Password requirement" className="w-3.5 h-3.5" />
              <p className="text-[11px] text-[#c13515]">
                Password must be at least 8 characters long
              </p>
            </div>
          )}
        </div>

        {/* Required Terms, Privacy & Community Guidelines Checkbox */}
        <div className="mt-1 p-2.5 sm:p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setTermsError(false);
              }}
              className="mt-0.5 w-4 h-4 rounded-md border-neutral-300 dark:border-neutral-600 text-[#ff385c] focus:ring-[#ff385c] accent-[#ff385c] cursor-pointer shrink-0"
            />
            <span className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
              I agree to the{" "}
              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff385c] font-semibold underline hover:text-[#d90b63] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>
              , acknowledge the{" "}
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff385c] font-semibold underline hover:text-[#d90b63] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
              , and agree to follow the Journey Cuisine{" "}
              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff385c] font-semibold underline hover:text-[#d90b63] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Community Guidelines
              </Link>
              .
            </span>
          </label>

          {termsError && !acceptedTerms && (
            <div role="alert" className="flex flex-row items-center gap-1.5 mt-2 text-[#c13515]">
              <img src={errorIcon} alt="Terms required" className="w-3.5 h-3.5" />
              <p className="text-[11px] font-semibold">You must check the box to agree before continuing</p>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-1.5 pb-1">
          <button
            className={`bg-[#ff385c] hover:bg-[#d90b63] transition-all duration-200 text-white text-sm font-bold rounded-xl p-3 w-full shadow-md cursor-pointer flex items-center justify-center ${
              isLoading ? "cursor-not-allowed opacity-80" : ""
            } ${!acceptedTerms ? "opacity-75 hover:opacity-90" : ""}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <PulseLoader
                color="#f7f7f7"
                size={7}
                margin={4}
                speedMultiplier={0.6}
              />
            ) : (
              "Agree and continue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPopup;
