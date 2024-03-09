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
  return (
    <div
      onMouseDown={() => {
        setScale(true);
      }}
      onMouseUp={() => {
        setScale(false);
      }}
      className={`${style}
      ${
        storedCardData?.includes(name)
          ? " border-2 border-black bg-[#f7f7f7]"
          : "bg-white hover:bg-[#f7f7f7] hover:border-black border-[1.3px] border-[#dddddd] hover:border-[1.3px]"
      }
      ${scale ? "scale-90" : "scale-100"}
      `}
      onClick={() => {
        onClick(name);
      }}
    >
      <Img size={svgSize} />
      <p className={`${ptagStyle}`}>{name}</p>
    </div>
  );
};

export default StructureCard;
