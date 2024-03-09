/* eslint-disable react/prop-types */

const OverviewCard = ({ img, head, desc, num }) => {
  return (
    <div className=" flex flex-row justify-between items-center gap-5">
      <div className=" flex flex-row">
        <h1 className=" text-[#222222] font-medium text-base sm:text-2xl pr-5">
          {num}
        </h1>
        <div className=" flex flex-col gap-2 xl:min-w-[350px]">
          <h1 className=" text-[#222222] font-medium text-base sm:text-2xl">
            {head}
          </h1>
          <p className=" text-[#717171] text-xs sm:text-lg">{desc}</p>
        </div>
      </div>
      <img
        src={img}
        alt="preview"
        className=" aspect-square w-[80px] sm:w-[120px]"
      />
    </div>
  );
};

export default OverviewCard;
