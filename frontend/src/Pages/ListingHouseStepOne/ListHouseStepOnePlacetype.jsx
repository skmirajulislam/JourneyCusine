import { useState } from "react";
import { useListingFlow } from "../../context/ListingFlowContext";
import PlaceTypeCard from "../../components/listingHouse/PlaceTypeCard";
import { PiHouseLine } from "react-icons/pi";
import { BsDoorOpen, BsHouseAdd } from "react-icons/bs";

const ListHouseStepOnePlacetype = () => {
  const { newHouse, setNewHouse } = useListingFlow();
  const [storedCardData, setStoredCardData] = useState(newHouse?.privacyType || "");

  const handleStoreCardData = (name) => {
    setStoredCardData(name);
    setNewHouse((prev) => ({ ...prev, privacyType: name }));
  };

  return (
    <div className="flex flex-col gap-10 max-w-screen-sm mx-auto my-6 min-h-[70dvh]">
      <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium">
        What type of place will guests have?
      </h1>
      <div className="flex flex-col gap-5">
        <PlaceTypeCard
          head={"An entire place"}
          desc={"Guests have the whole place to themselves."}
          Img={PiHouseLine}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
        />
        <PlaceTypeCard
          head={"A room"}
          desc={
            "Guests have their own room in a home, plus access to shared spaces."
          }
          Img={BsDoorOpen}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
        />
        <PlaceTypeCard
          head={"A shared room"}
          desc={
            "Guests in a room or common area that may be shared with you or others."
          }
          Img={BsHouseAdd}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
        />
      </div>
    </div>
  );
};

export default ListHouseStepOnePlacetype;
