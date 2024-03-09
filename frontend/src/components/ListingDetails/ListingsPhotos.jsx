import { MdKeyboardArrowLeft } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

/* eslint-disable react/prop-types */
const ListingsPhotos = ({ listingData }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:block gap-5">
      {/* home btn for only small devices */}
      {/* <div className="block md:hidden">
        <Link to={"/"}>Home</Link>
      </div> */}

      <div className=" flex flex-row gap-1 items-center md:hidden ml-[-12px]">
        <div
          onClick={() => {
            navigate("/");
          }}
          className=" p-2 rounded-full hover:bg-[#f1f1f1] cursor-pointer transition duration-200 ease-in"
        >
          <MdKeyboardArrowLeft size={28} />
        </div>
        <Link to={"/"} className="font-medium">
          Home
        </Link>
      </div>

      {/* photos data */}
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-2 max-h-[400px] min-h-[300px] overflow-y-hidden rounded-md md:rounded-2xl">
        <div className=" md:rounded-tl-2xl md:rounded-bl-2xl md:col-span-2">
          <img
            src={listingData?.photos[0]}
            alt="Listing photos"
            className=" md:rounded-tl-2xl md:rounded-bl-2xl aspect-video object-cover w-full h-[240px] md:h-full"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-none md:grid-rows-2 gap-x-1 md:gap-x-0 gap-y-2 max-h-[400px] min-h-[300px] md:col-span-1">
          <div className=" overflow-y-hidden">
            <img
              src={listingData?.photos[1]}
              alt="Listing photos"
              className=" md:rounded-tr-2xl aspect-video object-cover mb-2 w-full h-full"
            />
          </div>
          <div className=" overflow-y-hidden">
            <img
              src={listingData?.photos[2]}
              alt="Listing photos"
              className=" md:rounded-br-2xl aspect-video object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingsPhotos;
