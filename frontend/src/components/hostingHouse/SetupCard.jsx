/* eslint-disable react/prop-types */
const SetupCard = ({ heading, subHeading, img }) => {
  return (
    <div
      className={` flex flex-col gap-2 ${
        img ? " justify-between items-center" : ""
      }`}
    >
      <img
        src={img}
        alt="apartment"
        className={` w-[340px] sm:w-[280px] lg:max-w-[300px] 2xl:max-w-[340px] rounded-lg ${
          img ? "block" : "hidden"
        }`}
      />
      <div className={`${img ? "" : "flex flex-col gap-2"}`}>
        <h3
          className={` text-[#222222]  font-medium ${
            img ? " text-center text-xs md:text-sm xl:text-base" : " text-lg"
          }`}
        >
          {heading}
        </h3>
        <p
          className={`text-[#717171] ${
            img
              ? "text-center text-xs md:text-sm xl:text-base"
              : "text-sm sm:text-base"
          }`}
        >
          {subHeading}
        </p>
      </div>
    </div>
  );
};

export default SetupCard;
