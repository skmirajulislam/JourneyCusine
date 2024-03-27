import { useSelector } from "react-redux";

import { AiFillStar } from "react-icons/ai";

const PreviewCard = () => {
  const currentHouseData = useSelector(
    (state) => state.house.currentListingHouse
  );
  return (
    <>
      <div
        className=" flex flex-col gap-3 rounded-2xl shadow-lg bg-white border-[#f1f1f1] border max-w-sm p-4 cursor-pointer mx-auto"
        onClick={() => window.my_modal_4.showModal()}
      >
        <div className=" relative ">
          {currentHouseData?.photos[0] ? (
            <img
              src={currentHouseData?.photos[0]}
              alt="Beautiful house for hositng"
              className=" aspect-square object-cover rounded-xl"
            />
          ) : (
            <div className=" bg-gray-500 blur-md opacity-30 aspect-square rounded-xl">
              {" "}
            </div>
          )}
          <p className=" text-sm text-[#222222] px-3 py-1 rounded-md bg-white absolute top-3 left-3">
            Show preview
          </p>
        </div>
        <div className=" grid grid-cols-2 justify-between relative px-1">
          <div className=" text-sm text-[#222222]">
            <p className=" font-medium truncate w-[200px]">
              {currentHouseData?.title}
            </p>
            <span className=" flex flex-row gap-1">
              <p className=" font-bold">${currentHouseData?.basePrice}</p>
              <span>night</span>
            </span>
          </div>
          <span className=" flex flex-row items-center gap-1 text-sm text-[#222222] absolute top-0 right-0">
            New
            <AiFillStar size={16} />
          </span>
        </div>
      </div>
      {/* modal data for Preview Card */}
      <dialog id="my_modal_4" className="modal">
        <form method="dialog" className="modal-box w-11/12 max-w-5xl">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          <h3 className="font-bold text-lg text-center">Full preview</h3>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto py-7">
            <div>
              <img
                src={currentHouseData?.photos[0]}
                alt="Houses"
                className=" max-w-md rounded-xl object-cover ml-4"
              />
            </div>
            <div className=" flex flex-col gap-3">
              <h6 className="text-white text-3xl text-[#222222] font-semibold">
                {currentHouseData?.title}
              </h6>
              <p className="text-white text-xl font-medium text-[#222222] mt-3">
                Entire rental unit is hosted.
              </p>
              <p className=" text-white text-base text-[#222222]">
                {currentHouseData?.floorPlan?.guests} guests ·{" "}
                {currentHouseData?.floorPlan?.bedrooms} bedrooms ·{" "}
                {currentHouseData?.floorPlan?.beds} bed ·{" "}
                {currentHouseData?.floorPlan?.bathroomsNumber} bath
              </p>
              <hr className=" h-[1px] bg-[#dddddd] my-5" />
              <p className="text-white text-base text-[#222222]">
                Surround yourself with style in this standout space.
              </p>
              <hr className=" h-[1px] bg-[#dddddd] my-5" />
              <p className="text-white text-base text-[#222222] font-medium mb-5">
                Location
              </p>
              <p className="text-white">
                {currentHouseData?.location?.addressLineOne
                  ? currentHouseData?.location?.addressLineOne
                  : currentHouseData?.location?.addressLineTwo
                  ? currentHouseData?.location?.addressLineTwo
                  : currentHouseData?.location?.country?.name}
              </p>
              <p className="text-white text-xs text-[#222222] opacity-60">
                We’ll only share your address with guests who are booked as
                outlined in our privacy policy.
              </p>
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default PreviewCard;
