import { PiHouseLine, PiTent } from "react-icons/pi";
import {
  MdOutlineApartment,
  MdOutlineCabin,
  MdOutlineCastle,
} from "react-icons/md";
import { TbSailboat2, TbCamper } from "react-icons/tb";
import {
  GiMountainCave,
  GiLightningDome,
  GiControlTower,
  GiTreehouse,
} from "react-icons/gi";
import { GoContainer } from "react-icons/go";
import { RiEarthquakeLine } from "react-icons/ri";
import { LiaHotelSolid } from "react-icons/lia";
import StructureCard from "../../components/listingHouse/StructureCard";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { createNewHouse } from "../../redux/actions/houseActions";

const ListHouseStepOneStructure = () => {
  const [storedCardData, setStoredCardData] = useState("");
  const dispatch = useDispatch();
  const svgSize = window.innerWidth < 768 ? 28 : 40;

  const handleStoreCardData = (name) => {
    setStoredCardData(name);
    dispatch(createNewHouse(name));
  };

  return (
    <div className=" flex flex-col gap-10 max-w-screen-md mx-auto my-6">
      <h1 className=" text-[#222222] text-xl sm:text-2xl md:text-[32px] font-medium">
        Which of these best describes <br /> your place?
      </h1>
      <div className=" grid grid-cols-2 md:grid-cols-3 gap-5 mx-auto md:mx-0">
        <StructureCard
          style={structureCardStyle}
          Img={PiHouseLine}
          name={"House"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={MdOutlineApartment}
          name={"Apartment"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={GiTreehouse}
          name={"Tree house"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={TbSailboat2}
          name={"Boat"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={MdOutlineCabin}
          name={"Cabin"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={TbCamper}
          name={"Camper"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={MdOutlineCastle}
          name={"Castle"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={GiMountainCave}
          name={"Cave"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={GoContainer}
          name={"Container"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={GiLightningDome}
          name={"Dome"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={RiEarthquakeLine}
          name={"Earth home"}
          onClick={handleStoreCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={PiTent}
          name={"Tent"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={GiControlTower}
          name={"Tower"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
        <StructureCard
          style={structureCardStyle}
          Img={LiaHotelSolid}
          name={"Hotel"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={structurePtagClass}
        />
      </div>
    </div>
  );
};

// styles for STructuredCard component
const structureCardStyle =
  "flex flex-col gap-1 px-6 rounded-xl transition duration-300 h-[120px] w-[150px] sm:w-[220px] cursor-pointer justify-center";
const structurePtagClass = "text-[#222222] text-base md:text-lg font-medium";

export default ListHouseStepOneStructure;
