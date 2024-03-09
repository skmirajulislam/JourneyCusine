import { useDispatch, useSelector } from "react-redux";
import StructureCard from "../../components/listingHouse/StructureCard";
import { useEffect, useState } from "react";
import { createNewHouse } from "../../redux/actions/houseActions";

import { LiaShoePrintsSolid } from "react-icons/lia";
import { PiComputerTower } from "react-icons/pi";
import { TbBuildingSkyscraper, TbBuilding } from "react-icons/tb";
import { CiLocationOn } from "react-icons/ci";
import { HiOutlineUserGroup } from "react-icons/hi";

const Highlight = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const [storedCardData, setStoredCardData] = useState([]);
  const dispatch = useDispatch();
  const svgSize = 24;

  const handleStoreCardData = (name) => {
    if (storedCardData.includes(name)) {
      storedCardData.pop(name);
      setStoredCardData([...storedCardData]);
    } else {
      setStoredCardData([...storedCardData, name]);
    }
  };
  useEffect(() => {
    dispatch(
      createNewHouse(
        newHouseData?.houseType,
        newHouseData?.privacyType,
        newHouseData?.location,
        newHouseData?.floorPlan,
        newHouseData?.amenities,
        newHouseData?.photos,
        newHouseData?.title,
        storedCardData
      )
    );
  }, [storedCardData, dispatch]);

  console.log(storedCardData, "from descriptions");

  return (
    <div className=" flex flex-col gap-10 max-w-screen-md mx-auto my-8 xl:py-[15vh] min-h-[70vh]">
      <div className="flex flex-col gap-3 md:gap-0">
        <h1 className=" text-[#222222] text-xl sm:text-2xl md:text-[32px] font-medium">
          Next, let&apos;s describe your apartment
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171]">
          Choose up to 2 highlights. We&apos;ll use these to get your
          description started.
        </p>
      </div>
      <div className=" flex flex-wrap gap-5">
        <StructureCard
          style={descriptionCardStyle}
          Img={LiaShoePrintsSolid}
          name={"Peaceful"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={descriptionPtagStyle}
        />
        <StructureCard
          style={descriptionCardStyle}
          Img={PiComputerTower}
          name={"Unique"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={descriptionPtagStyle}
        />
        <StructureCard
          style={descriptionCardStyle}
          Img={TbBuildingSkyscraper}
          name={"Family-friendly"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={descriptionPtagStyle}
        />
        <StructureCard
          style={descriptionCardStyle}
          Img={TbBuilding}
          name={"Stylish"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={descriptionPtagStyle}
        />
        <StructureCard
          style={descriptionCardStyle}
          Img={CiLocationOn}
          name={"Central"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={descriptionPtagStyle}
        />
        <StructureCard
          style={descriptionCardStyle}
          Img={HiOutlineUserGroup}
          name={"Spacious"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={descriptionPtagStyle}
        />
      </div>
    </div>
  );
};

// styles for STructuredCard component
const descriptionCardStyle =
  "flex flex-row items-center gap-2 px-6 py-3 rounded-full transition duration-300 cursor-pointer justify-center";
const descriptionPtagStyle = "text-[#222222] text-base font-medium";

export default Highlight;
