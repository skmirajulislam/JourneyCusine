import { useState } from "react";
import { useListingFlow } from "../../context/ListingFlowContext";
import PlaceTypeCard from "../../components/listingHouse/PlaceTypeCard";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsFillCheckCircleFill } from "react-icons/bs";

const Visibility = () => {
  const { newHouse, currentListingHouse, setNewHouse } = useListingFlow();
  const initialGuestType = newHouse?.guestType || currentListingHouse?.guestType || "";
  const [storedCardData, setStoredCardData] = useState(initialGuestType);

  const handleStoreCardData = (name) => {
    setStoredCardData(name);
    setNewHouse((prev) => ({
      ...prev,
      guestType: name,
    }));
  };

  return (
    <div className="flex flex-col gap-10 max-w-screen-md mx-auto my-6 min-h-[70vh]">
      <div>
        <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium">
          Choose who to welcome for your first reservation
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400">
          After your first guest, anyone can book your place.
        </p>
      </div>
      <PlaceTypeCard
        desc={
          "Get reservations faster when you welcome anyone from the Journey Cuisine community."
        }
        head={"Any Journey Cuisine guest"}
        onClick={handleStoreCardData}
        storedCardData={storedCardData}
        CheckOutline={AiOutlineCheckCircle}
        CheckFill={BsFillCheckCircleFill}
      />
      <PlaceTypeCard
        desc="For your first guest, welcome someone with a good track record who can offer tips for how to be a great Host"
        head={"An Experienced guest"}
        onClick={handleStoreCardData}
        storedCardData={storedCardData}
        CheckOutline={AiOutlineCheckCircle}
        CheckFill={BsFillCheckCircleFill}
      />
    </div>
  );
};

export default Visibility;
