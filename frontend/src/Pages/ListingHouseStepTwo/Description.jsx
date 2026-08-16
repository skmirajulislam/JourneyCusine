import { useState, useEffect } from "react";
import { useListingFlow } from "../../context/ListingFlowContext";

const Description = () => {
  const { newHouse, currentListingHouse, setNewHouse } = useListingFlow();
  const initialDesc = newHouse?.description || currentListingHouse?.description || "";

  const [description, setDescription] = useState(initialDesc);
  const [characterCount, setCharacterCount] = useState(initialDesc.length);

  useEffect(() => {
    if (initialDesc && !description) {
      setDescription(initialDesc);
      setCharacterCount(initialDesc.length);
    }
  }, [initialDesc, description]);

  const updateDescriptionState = (newVal) => {
    setNewHouse((prev) => ({
      ...prev,
      description: newVal,
    }));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    setCharacterCount(val.length);
    updateDescriptionState(val);
  };

  return (
    <div className="flex flex-col gap-8 max-w-screen-sm mx-auto my-6 min-h-[80vh]">
      <div>
        <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium">
          Create your description
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400">
          Share what makes your place special, nearby attractions, and amenities.
        </p>
      </div>
      <div>
        <textarea
          className="w-full p-3.5 border-[#b0b0b0] dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-[#111827] dark:text-white border-[1.3px] rounded-2xl focus:outline-none focus:border-black dark:focus:border-white transition-all shadow-xs"
          rows="8"
          value={description}
          onChange={handleInputChange}
          onBlur={() => updateDescriptionState(description)}
          placeholder="Write your house and motel stay description here (minimum 10 characters)..."
          maxLength={1600}
        />
        <div className="mt-2 mb-3 flex items-center justify-between">
          <span className="text-xs text-rose-500 font-medium">
            {(!description?.trim() || description.trim().length < 10) &&
              "Description must be at least 10 characters to proceed"}
          </span>
          <p
            className={`text-xs font-semibold ${
              characterCount >= 1600
                ? "text-red-500"
                : "text-[#717171] dark:text-neutral-400"
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
