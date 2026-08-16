import { useState, useEffect, useMemo } from "react";
import { useListingFlow } from "../../context/ListingFlowContext";
import { City, Country, State } from "country-state-city";
import Select from "react-select";

const ListingHouseStepOneAddress = () => {
  const { newHouse, currentListingHouse, setNewHouse } = useListingFlow();
  const existingLoc = useMemo(
    () => newHouse?.location || currentListingHouse?.location || {},
    [newHouse?.location, currentListingHouse?.location]
  );

  const [formData, setFormData] = useState({
    country: existingLoc.country || "",
    addressLineOne: existingLoc.addressLineOne || "",
    addressLineTwo: existingLoc.addressLineTwo || "",
    city: existingLoc.city || "",
    state: existingLoc.state || "",
    postCode: existingLoc.postCode || "",
  });

  useEffect(() => {
    if (existingLoc && !formData.country && existingLoc.country) {
      setFormData({
        country: existingLoc.country || "",
        addressLineOne: existingLoc.addressLineOne || "",
        addressLineTwo: existingLoc.addressLineTwo || "",
        city: existingLoc.city || "",
        state: existingLoc.state || "",
        postCode: existingLoc.postCode || "",
      });
    }
  }, [existingLoc, formData.country]);

  const syncState = (updated) => {
    setNewHouse((prev) => ({
      ...prev,
      location: updated,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value,
    };
    setFormData(updated);
    syncState(updated);
  };

  const selectCustomStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: "8px",
      borderRadius: "12px",
      cursor: "pointer",
      boxShadow: state.isFocused ? "0 0 0 1px #ff385c" : "none",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "12px",
      overflow: "hidden",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      cursor: "pointer",
      padding: "10px 14px",
      fontWeight: state.isSelected ? "600" : "normal",
    }),
  };

  return (
    <section className="flex flex-col gap-10 max-w-screen-md mx-auto my-6 min-h-[70vh] 2xl:h-[80vh]">
      <div className="flex flex-col gap-2">
        <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium">
          Confirm your address
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400">
          Your address is only shared with guests after they&apos;ve made a reservation.
        </p>
        <div className="flex flex-col gap-5 mt-5">
          <Select
            options={Country.getAllCountries()}
            getOptionLabel={(options) => options["name"]}
            getOptionValue={(options) => options["name"]}
            value={formData.country}
            onChange={(item) => {
              const updated = { ...formData, country: item };
              setFormData(updated);
              syncState(updated);
            }}
            className="react-select-container text-sm"
            classNamePrefix="react-select"
            placeholder="Country / Region? (Required)"
            styles={selectCustomStyles}
          />
          <Select
            options={State.getStatesOfCountry(formData?.country?.isoCode)}
            getOptionLabel={(options) => options["name"]}
            getOptionValue={(options) => options["name"]}
            value={formData.state}
            onChange={(item) => {
              const updated = { ...formData, state: item };
              setFormData(updated);
              syncState(updated);
            }}
            className="react-select-container text-sm"
            classNamePrefix="react-select"
            placeholder="State / province / territory (if applicable)"
            styles={selectCustomStyles}
          />
          <Select
            options={City.getCitiesOfState(
              formData?.state?.countryCode,
              formData?.state?.isoCode
            )}
            getOptionLabel={(options) => options["name"]}
            getOptionValue={(options) => options["name"]}
            value={formData.city}
            onChange={(item) => {
              const updated = { ...formData, city: item };
              setFormData(updated);
              syncState(updated);
            }}
            className="react-select-container text-sm"
            classNamePrefix="react-select"
            placeholder="City / village (Required)"
            styles={selectCustomStyles}
          />
          <input
            type="text"
            name="addressLineOne"
            placeholder="Address line 1 (Required)"
            className="w-full p-3.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-[#111827] dark:text-white rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm placeholder-neutral-400 dark:placeholder-neutral-500 shadow-xs"
            value={formData.addressLineOne}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="addressLineTwo"
            placeholder="Address line 2 (if applicable)"
            className="w-full p-3.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-[#111827] dark:text-white rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm placeholder-neutral-400 dark:placeholder-neutral-500 shadow-xs"
            value={formData.addressLineTwo}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="postCode"
            placeholder="Postal code (if applicable)"
            className="w-full p-3.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-[#111827] dark:text-white rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm placeholder-neutral-400 dark:placeholder-neutral-500 shadow-xs"
            value={formData.postCode}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </section>
  );
};

export default ListingHouseStepOneAddress;
