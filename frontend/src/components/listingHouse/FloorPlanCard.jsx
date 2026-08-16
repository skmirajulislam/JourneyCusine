 
import { BiPlus, BiMinus } from "react-icons/bi";

const FloorPlanCard = ({ name, number, setNumber, filter }) => {
  return (
    <div className="flex flex-row justify-between items-center gap-10 text-[#222222] dark:text-white">
      <p className={`${filter ? "text-sm text-neutral-700 dark:text-neutral-200" : "text-lg font-medium text-[#222222] dark:text-white"}`}>{name}</p>
      <div className="flex flex-row gap-3 items-center text-base">
        <button
          type="button"
          className={`p-2 rounded-full border border-[#dddddd] dark:border-neutral-700 hover:border-[#717171] dark:hover:border-neutral-400 text-[#222222] dark:text-white bg-white dark:bg-[#252525] transition duration-200
          ${
            name === "Beds" && !filter && number < 2
              ? "opacity-40 cursor-not-allowed"
              : "cursor-pointer hover:scale-105 active:scale-95"
          }
          `}
          onClick={() => {
            if (number === 0 || (name === "Beds" && number < 2 && !filter))
              return;
            if (number > 0) {
              setNumber((prev) => prev - 1);
            }
          }}
        >
          <BiMinus size={filter ? 14 : 18} />
        </button>
        <p className="w-[24px] text-center font-bold text-[#111827] dark:text-white">{number}</p>
        <button
          type="button"
          className="p-2 rounded-full border border-[#dddddd] dark:border-neutral-700 hover:border-[#717171] dark:hover:border-neutral-400 text-[#222222] dark:text-white bg-white dark:bg-[#252525] cursor-pointer transition duration-200 hover:scale-105 active:scale-95"
          onClick={() => {
            setNumber((prev) => prev + 1);
          }}
        >
          <BiPlus size={filter ? 14 : 18} />
        </button>
      </div>
    </div>
  );
};

export default FloorPlanCard;
