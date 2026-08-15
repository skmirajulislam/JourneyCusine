/* eslint-disable react/prop-types */

const OverviewCard = ({ img, head, desc, num }) => {
  return (
    <div className="flex flex-row justify-between items-center gap-5">
      <div className="flex flex-row">
        <h2 className="text-[#111827] dark:text-white font-bold text-base sm:text-2xl pr-5">
          {num}
        </h2>
        <div className="flex flex-col gap-1.5 xl:min-w-[350px]">
          <h2 className="text-[#111827] dark:text-white font-bold text-base sm:text-2xl">
            {head}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-base leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
      <img
        src={img}
        alt={head}
        className="aspect-square w-[80px] sm:w-[120px] object-contain shrink-0"
      />
    </div>
  );
};

export default OverviewCard;
