/* eslint-disable react/prop-types */
import { AiFillStar } from "react-icons/ai";

const ListingPreviewCard = ({ listingData, showBeforeTaxPrice }) => {
  const taxes = Math.round((listingData?.basePrice * 14) / 100);
  const priceAfterTaxes = listingData?.basePrice + taxes;
  return (
    <>
      <div className=" h-[310px] md:h-[277px] overflow-hidden rounded-xl">
        <img
          src={listingData?.photos[0]}
          alt="Listing images"
          className=" w-full h-[310px] md:h-[277px] object-cover object-center rounded-xl hover:scale-110 transition duration-500 ease-in-out cursor-pointer"
        />
      </div>
      <div className=" flex flex-row justify-between items-start w-full">
        {/* listings details */}
        <div className=" flex flex-col gap-1">
          <p className="text-sm text-[#222222] font-medium">
            {listingData?.location?.city?.name},{" "}
            {listingData?.location?.country?.name}
          </p>
          {showBeforeTaxPrice && (
            <p className="text-sm text-[#717171]">
              After tax ${priceAfterTaxes}{" "}
              <span className=" font-normal">night</span>
            </p>
          )}
          <p className="text-sm text-[#222222] font-semibold">
            ${listingData?.basePrice}{" "}
            <span className=" font-normal">night</span>
          </p>
        </div>
        {/* ratings / new status */}
        <div className=" flex flex-row gap-1 items-center">
          {listingData?.ratings ? (
            <>
              <AiFillStar size={16} />
              <p className=" text-sm">{listingData?.ratings}</p>
            </>
          ) : (
            <>
              <AiFillStar size={16} />
              <p className=" text-sm">New</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ListingPreviewCard;
