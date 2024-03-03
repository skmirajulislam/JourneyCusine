import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createNewHouse } from "../../redux/actions/houseActions";

const Description = () => {
  const { register } = useForm();
  const [characterCount, setCharacterCount] = useState(0);
  const [description, setDescription] = useState(null);
  const newHouseData = useSelector((state) => state.house.newHouse);
  const dispatch = useDispatch();

  const handleChange = () => {
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
        description
      )
    );
  };
  console.log(description, "description");
  return (
    <div className=" flex flex-col gap-8 max-w-screen-sm mx-auto my-6 min-h-[80vh]">
      <div>
        <h1 className=" text-[#222222] text-xl sm:text-2xl md:text-[32px] font-medium">
          Create your description
        </h1>
        <p className=" text-sm sm:text-base md:text-lg text-[#717171]">
          Share what makes your place special.
        </p>
      </div>
      <div>
        <textarea
          className=" w-full p-3 border-[#b0b0b0] border-[1.3px] rounded-md"
          rows="9"
          autoComplete="off"
          {...register("profileDetailsAbout", { maxLength: 1600 })}
          onChange={(event) => {
            setDescription(event.target.value);
            setCharacterCount(event.target.value.replace(/\s/g, " ").length);
            handleChange(event);
          }}
          onBlur={handleChange}
          placeholder="Write your house description here..."
        ></textarea>
        <div className=" mt-2 mb-3">
          <p
            className={` text-xs font-semibold mt-1 flex flex-row-reverse ${
              characterCount > 1600 ? " text-red-400" : "text-[#717171]"
            }`}
          >
            {characterCount}/1600 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default Description;
