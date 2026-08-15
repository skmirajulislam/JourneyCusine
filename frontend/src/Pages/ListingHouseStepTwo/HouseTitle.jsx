import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewHouse } from "../../redux/actions/houseActions";

const HouseTitle = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const currentListing = useSelector((state) => state.house.currentListingHouse);
  const initialTitle = newHouseData?.title || currentListing?.title || "";

  const [title, setTitle] = useState(initialTitle);
  const [characterCount, setCharacterCount] = useState(initialTitle.length);
  const dispatch = useDispatch();

  useEffect(() => {
    if (initialTitle && !title) {
      setTitle(initialTitle);
      setCharacterCount(initialTitle.length);
    }
  }, [initialTitle, title]);

  const updateReduxTitle = (newVal) => {
    dispatch(
      createNewHouse(
        newHouseData?.houseType || currentListing?.houseType,
        newHouseData?.privacyType || currentListing?.privacyType,
        newHouseData?.location || currentListing?.location,
        newHouseData?.floorPlan || currentListing?.floorPlan,
        newHouseData?.amenities || currentListing?.amenities,
        newHouseData?.photos || currentListing?.photos,
        newVal,
        newHouseData?.highlights || currentListing?.highlight,
        newHouseData?.description || currentListing?.description
      )
    );
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    setCharacterCount(val.length);
    updateReduxTitle(val);
  };

  return (
    <div className="flex flex-col gap-10 max-w-screen-sm mx-auto my-6 min-h-[80vh]">
      <div className="flex flex-col gap-3 md:gap-0">
        <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium">
          Now, let&apos;s give your place a title
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400">
          Short titles work best. Have fun with it—you can always change it later.
        </p>
      </div>
      <div>
        <textarea
          className="w-full p-3.5 border-[#b0b0b0] dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-[#111827] dark:text-white border-[1.3px] rounded-2xl focus:outline-none focus:border-black dark:focus:border-white transition-all shadow-xs"
          rows="5"
          value={title}
          onChange={handleInputChange}
          onBlur={() => updateReduxTitle(title)}
          placeholder="e.g., Cozy Seaside Villa in Malibu"
          maxLength={40}
        />
        <div className="mt-2 mb-3 flex items-center justify-between">
          <span className="text-xs text-rose-500 font-medium">
            {!title?.trim() && "Title is required to proceed"}
          </span>
          <p
            className={`text-xs font-semibold ${
              characterCount >= 40
                ? "text-red-500"
                : "text-[#717171] dark:text-neutral-400"
            }`}
          >
            {characterCount}/40 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default HouseTitle;
