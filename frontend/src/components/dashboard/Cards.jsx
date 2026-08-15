/* eslint-disable react/prop-types */
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";

const Cards = ({ title, icon, heading, subHead, delta, isPositive, isNeutral }) => {
  return (
    <div className="w-full bg-white dark:bg-[#1f1f1f] shadow-sm hover:shadow-md transition-shadow rounded-2xl border border-gray-100 dark:border-[#2f2f2f] flex flex-col justify-between p-6 min-h-[145px]">
      <div className="flex flex-row justify-between items-center">
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs sm:text-sm uppercase tracking-wider">
          {title}
        </p>
        <div className="w-9 h-9 rounded-xl bg-neutral-50 dark:bg-[#282828] flex items-center justify-center p-2">
          {typeof icon === "string" ? (
            <img src={icon} alt={title} className="w-5 h-5 object-contain dark:invert" />
          ) : (
            icon
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        <h3 className="text-2xl sm:text-3xl text-zinc-900 dark:text-white font-bold tracking-tight">
          {heading}
        </h3>

        <div className="flex items-center gap-1.5">
          {delta !== undefined ? (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isNeutral
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  : isPositive
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isNeutral ? (
                <FiMinus size={11} />
              ) : isPositive ? (
                <FiTrendingUp size={11} />
              ) : (
                <FiTrendingDown size={11} />
              )}
              {delta}
            </span>
          ) : (
            <p className="text-xs text-[#717171] dark:text-[#a0a0a0] font-medium">
              {subHead}
            </p>
          )}
          {subHead && delta !== undefined && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              vs last month
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cards;
