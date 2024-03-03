import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewHouse } from "../../redux/actions/houseActions";
import { City, Country, State } from "country-state-city";
import Select from "react-select";

const ListingHouseStepOneAddress = () => {
  const houseData = useSelector((state) => state.house);
  const dispatch = useDispatch();

  // State to manage form data
  const [formData, setFormData] = useState({
    country: "",
    addressLineOne: "",
    addressLineTwo: "",
    city: "",
    state: "",
    postCode: "",
  });

  const handleStoreCardData = () => {
    if (formData.country) {
      dispatch(
        createNewHouse(
          houseData.newHouse?.houseType,
          houseData.newHouse?.privacyType,
          formData
        )
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <section className=" flex flex-col gap-10 max-w-screen-md mx-auto my-6 min-h-[70vh] 2xl:h-[80vh]">
      <div className=" flex flex-col gap-2">
        <h1 className=" text-[#222222] text-xl sm:text-2xl md:text-[32px] font-medium">
          Confirm your address
        </h1>
        <p className=" text-sm sm:text-base md:text-lg text-[#717171]">
          Your address is only shared with guests after they’ve made a
          reservation.
        </p>
        <div className=" flex flex-col gap-5 mt-5">
          <Select
            options={Country.getAllCountries()}
            getOptionLabel={(options) => options["name"]}
            getOptionValue={(options) => options["name"]}
            value={formData.country}
            onChange={(item) => {
              setFormData({ ...formData, country: item });
            }}
            onBlur={handleStoreCardData}
            className=" "
            placeholder=" Country / Region?"
            styles={{
              control: (provided) => ({
                ...provided,
                padding: "12px", // Custom styling for react select
                borderRadius: "8px",
              }),
            }}
          />
          <Select
            options={State.getStatesOfCountry(formData?.country?.isoCode)}
            getOptionLabel={(options) => options["name"]}
            getOptionValue={(options) => options["name"]}
            value={formData.state}
            onChange={(item) => {
              setFormData({ ...formData, state: item });
            }}
            onBlur={handleStoreCardData}
            className=" "
            placeholder="State / province / territory (if applicable)"
            styles={{
              control: (provided) => ({
                ...provided,
                padding: "8px", // Custom styling for react select
                borderRadius: "8px",
              }),
            }}
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
              setFormData({ ...formData, city: item });
            }}
            onBlur={handleStoreCardData}
            className=" "
            placeholder="City / village (if applicable)"
            styles={{
              control: (provided) => ({
                ...provided,
                padding: "8px", // Custom styling for react select
                borderRadius: "8px",
              }),
            }}
          />
          <input
            type="text"
            name="addressLineOne"
            placeholder="Address line 1"
            className="input input-bordered w-full p-3"
            value={formData.addressLineOne}
            onChange={handleInputChange}
            onBlur={handleStoreCardData}
          />
          <input
            type="text"
            name="addressLineTwo"
            placeholder="Address line 2 (if applicable)"
            className="input input-bordered w-full p-3"
            value={formData.addressLineTwo}
            onChange={handleInputChange}
            onBlur={handleStoreCardData}
          />
          <input
            type="number"
            name="postCode"
            placeholder="Postal code (if applicable)"
            className="input input-bordered w-full p-3"
            value={formData.postCode}
            onChange={handleInputChange}
            onBlur={handleStoreCardData}
          />
        </div>
      </div>
    </section>
  );
};

export default ListingHouseStepOneAddress;
