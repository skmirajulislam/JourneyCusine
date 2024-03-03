import StructureCard from "../../components/listingHouse/StructureCard";
import { HiOutlineWifi } from "react-icons/hi";
import {
  PiTelevisionSimple,
  PiCampfireLight,
  PiFireExtinguisher,
} from "react-icons/pi";
import {
  MdOutlineKitchen,
  MdOutlinePool,
  MdOutlineOutdoorGrill,
  MdDinnerDining,
} from "react-icons/md";
import { BiSolidWasher, BiSolidFirstAid } from "react-icons/bi";
import { AiOutlineCar, AiOutlineAlert } from "react-icons/ai";
import { CgPiano } from "react-icons/cg";
import { CiDumbbell } from "react-icons/ci";
import { FaShower } from "react-icons/fa";
import { TbBrandCarbon } from "react-icons/tb";
import { GiBathtub, GiTennisCourt, GiSkier } from "react-icons/gi";
import { BsSpeedometer2, BsSnow, BsPersonWorkspace } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { createNewHouse } from "../../redux/actions/houseActions";

const Amenities = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const [storedCardData, setStoredCardData] = useState([]);
  const dispatch = useDispatch();
  const svgSize = window.innerWidth < 768 ? 28 : 40;

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
        storedCardData
      )
    );
  }, [storedCardData, dispatch]);

  console.log(storedCardData, "amenities");
  return (
    <div className=" flex flex-col gap-10 max-w-screen-md mx-auto my-6">
      <div>
        <h1 className=" text-[#222222] text-xl sm:text-2xl md:text-[32px] font-medium">
          Tell guests what your place has to offer
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171]">
          You can add more amenities after you publish your listing.
        </p>
      </div>
      {/* 1st section */}
      <div className=" grid grid-cols-2 md:grid-cols-3 gap-5">
        <StructureCard
          style={amenitisCardStyle}
          Img={HiOutlineWifi}
          name={"Wifi"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={amenitesPtagClass}
        />
        <StructureCard
          style={amenitisCardStyle}
          Img={PiTelevisionSimple}
          name={"TV"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={amenitesPtagClass}
        />
        <StructureCard
          style={amenitisCardStyle}
          Img={MdOutlineKitchen}
          name={"Kitchen"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={amenitesPtagClass}
        />
        <StructureCard
          style={amenitisCardStyle}
          Img={BiSolidWasher}
          name={"Washer"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={amenitesPtagClass}
        />
        <StructureCard
          style={amenitisCardStyle}
          Img={BsSpeedometer2}
          name={"Paid parking"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={amenitesPtagClass}
        />
        <StructureCard
          style={amenitisCardStyle}
          Img={BsSnow}
          name={"Air conditioning"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={amenitesPtagClass}
        />
        <StructureCard
          style={amenitisCardStyle}
          Img={BsPersonWorkspace}
          name={"Dedicated workspace"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={amenitesPtagClass}
        />
        <StructureCard
          style={amenitisCardStyle}
          Img={AiOutlineCar}
          name={"Free parking"}
          onClick={handleStoreCardData}
          storedCardData={storedCardData}
          svgSize={svgSize}
          ptagStyle={amenitesPtagClass}
        />
      </div>
      {/* 2nd section */}
      <div className=" flex flex-col gap-4">
        <h6 className=" text-lg text-[#222222] font-medium my-2">
          Do you have any stand out amenities?
        </h6>
        <div className=" grid grid-cols-2 md:grid-cols-3 gap-5">
          <StructureCard
            style={amenitisCardStyle}
            Img={MdOutlinePool}
            name={"Pool"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={GiBathtub}
            name={"Buthub"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={MdOutlineOutdoorGrill}
            name={"Grill"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={PiCampfireLight}
            name={"Campfire"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={MdDinnerDining}
            name={"Outdoor dining area"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={CgPiano}
            name={"Piano"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={CiDumbbell}
            name={"Exercise equipment"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={FaShower}
            name={"Outdoor Shower"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={GiTennisCourt}
            name={"Tennis court"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={GiSkier}
            name={"Ski in/ Ski out"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
        </div>
      </div>
      {/* 3rd section */}
      <div className=" flex flex-col gap-4">
        <h6 className=" text-lg text-[#222222] font-medium my-2">
          Do you have any of these safety items?
        </h6>
        <div className=" grid grid-cols-2 md:grid-cols-3 gap-5">
          <StructureCard
            style={amenitisCardStyle}
            Img={AiOutlineAlert}
            name={"Safety alerm"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={BiSolidFirstAid}
            name={"First aid kit"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={PiFireExtinguisher}
            name={"Fire extinguisher"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
          <StructureCard
            style={amenitisCardStyle}
            Img={TbBrandCarbon}
            name={"Carbon monoxide alerm"}
            onClick={handleStoreCardData}
            storedCardData={storedCardData}
            svgSize={svgSize}
            ptagStyle={amenitesPtagClass}
          />
        </div>
      </div>
    </div>
  );
};

// styles for STructuredCard component
const amenitisCardStyle =
  "flex flex-col gap-1 px-6 rounded-xl transition duration-300 h-[120px] w-[150px] sm:w-[220px] cursor-pointer justify-center";
const amenitesPtagClass = "text-[#222222] text-base md:text-lg font-medium";

export default Amenities;
