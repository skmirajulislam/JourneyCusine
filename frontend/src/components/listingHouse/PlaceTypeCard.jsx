/* eslint-disable react/prop-types */
import { useState } from "react";

const PlaceTypeCard = ({
  head,
  desc,
  Img,
  onClick,
  storedCardData,
  CheckOutline,
  CheckFill,
}) => {
  const [scale, setScale] = useState(false);
  const svgSize = window.innerWidth < 768 ? 28 : 40;
  const isSelected = storedCardData === head;

  return (
    <div
      onClick={() => {
        onClick(head);
      }}
      onMouseDown={() => {
        setScale(true);
      }}
      onMouseUp={() => {
        setScale(false);
      }}
      className={`flex flex-row px-4 sm:px-8 items-center py-4 rounded-2xl cursor-pointer h-[120px] transition-all duration-200 select-none
      ${
        isSelected
          ? "border-2 border-black dark:border-white bg-[#f7f7f7] dark:bg-[#2c2c2c] text-[#111827] dark:text-white shadow-sm"
          : "border-[1.3px] border-[#dddddd] dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] hover:bg-[#f7f7f7] dark:hover:bg-[#282828] hover:border-black dark:hover:border-neutral-300 text-[#222222] dark:text-neutral-200"
      }
      ${CheckFill ? "gap-4" : "justify-between"}
      ${scale ? "scale-95" : "scale-100"}
      `}
    >
      {/* specific to Visibility section only */}
      {CheckFill && CheckOutline && (
        <div className="text-black dark:text-white">
          {isSelected ? <CheckFill size={28} /> : <CheckOutline size={28} />}
        </div>
      )}
      <div className="flex flex-col gap-1 pr-2 md:pr-0">
        <h4 className={`text-lg font-medium transition-colors ${isSelected ? "text-black dark:text-white font-bold" : "text-[#222222] dark:text-white"}`}>
          {head}
        </h4>
        <p className="text-xs sm:text-sm text-[#717171] dark:text-neutral-400">
          {desc}
        </p>
      </div>
      <div className={`transition-colors ${isSelected ? "text-black dark:text-white" : "text-[#222222] dark:text-neutral-200"}`}>
        {Img && <Img size={svgSize} />}
      </div>
    </div>
  );
};

export default PlaceTypeCard;
