import { useDispatch, useSelector } from "react-redux";
import PlaceTypeCard from "../../components/listingHouse/PlaceTypeCard";
import { createNewHouse } from "../../redux/actions/houseActions";
import { useState } from "react";

import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsFillCheckCircleFill } from "react-icons/bs";

const Visibility = () => {
  const [storedCardData, setStoredCardData] = useState("");
  const newHouseData = useSelector((state) => state.house.newHouse);
  const dispatch = useDispatch();

  const handleStoreCardData = (name) => {
    setStoredCardData(name);
    dispatch(
      createNewHouse(
        newHouseData?.houseType,
        newHouseData?.privacyType,
        newHouseData?.location,
        newHouseData?.floorPlan,
        newHouseData?.amenities,
        newHouseData?.photos,
        newHouseData?.title,
        newHouseData?.highlights,
        newHouseData?.description,
        name
      )
    );
  };

  return (
    <div className=" flex flex-col gap-10 max-w-screen-md mx-auto my-6 min-h-[70vh]">
      <div>
        <h1 className=" text-[#222222] text-xl sm:text-2xl md:text-[32px] font-medium">
          Choose who to welcome for your first reservation
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171]">
          After your first guest, anyone can book your place.
        </p>
      </div>
      <PlaceTypeCard
        desc={
          "Get reservations faster when you welcome anyone from the Motel community."
        }
        head={"Any Motel guest"}
        onClick={handleStoreCardData}
        storedCardData={storedCardData}
        CheckOutline={AiOutlineCheckCircle}
        CheckFill={BsFillCheckCircleFill}
      />
      <PlaceTypeCard
        desc="For your first guest, welcome someone with a good track record on Motel who can offer tips for how to be a great Host"
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
