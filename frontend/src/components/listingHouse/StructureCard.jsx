import { useState } from "react";

/* eslint-disable react/prop-types */
const StructureCard = ({
  style,
  name,
  Img,
  onClick,
  storedCardData,
  svgSize,
  ptagStyle,
}) => {
  const [scale, setScale] = useState(false);
  const isSelected = storedCardData?.includes(name);

  return (
    <div
      onMouseDown={() => {
        setScale(true);
      }}
      onMouseUp={() => {
        setScale(false);
      }}
      className={`${style} transition-all duration-200 select-none
      ${
        isSelected
          ? "border-2 border-black dark:border-white bg-[#f7f7f7] dark:bg-[#2c2c2c] text-[#111827] dark:text-white shadow-sm"
          : "bg-white dark:bg-[#1f1f1f] hover:bg-[#f7f7f7] dark:hover:bg-[#282828] border-[1.3px] border-[#dddddd] dark:border-neutral-700 hover:border-black dark:hover:border-neutral-300 text-[#222222] dark:text-neutral-200"
      }
      ${scale ? "scale-95" : "scale-100"}
      `}
      onClick={() => {
        onClick(name);
      }}
    >
      <div className={`transition-colors ${isSelected ? "text-black dark:text-white" : "text-[#222222] dark:text-neutral-200"}`}>
        <Img size={svgSize} />
      </div>
      <p className={`${ptagStyle} transition-colors ${isSelected ? "!text-black dark:!text-white font-bold" : "!text-[#222222] dark:!text-neutral-200"}`}>
        {name}
      </p>
    </div>
  );
};

export default StructureCard;
