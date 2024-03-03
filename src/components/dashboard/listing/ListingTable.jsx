import { useSelector } from "react-redux";

import { GrInProgress } from "react-icons/gr";
import { AiFillCheckCircle } from "react-icons/ai";

const ListingTable = () => {
  const allListingsData = useSelector((state) => state.house.housesData);
  return (
    <div className="flex flex-col overflow-x-auto">
      <div className="">
        <div className="inline-block min-w-full py-2">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm font-light">
              <thead className=" text-xs text-[#717171] font-medium border-b border-[#dddddd]">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    LISTING
                  </th>
                  <th scope="col" className="px-6 py-4">
                    STATUS
                  </th>
                  <th scope="col" className="px-6 py-4">
                    INSTANT BOOK
                  </th>
                  <th scope="col" className="px-6 py-4">
                    BEDROOMS
                  </th>
                  <th scope="col" className="px-6 py-4">
                    BEDS
                  </th>
                  <th scope="col" className="px-6 py-4">
                    BATHS
                  </th>
                  <th scope="col" className="px-6 py-4">
                    LOCATION
                  </th>
                  <th scope="col" className="px-6 py-4">
                    CREATED AT
                  </th>
                </tr>
              </thead>
              <tbody>
                {allListingsData?.map((listing, i, arr) => {
                  return (
                    <tr
                      key={i}
                      className={`${
                        i === arr.length - 1 ? "" : "border-b border-[#dddddd]"
                      }`}
                    >
                      {/* images & title */}
                      <td className=" px-6 py-4 flex flex-row items-center gap-2">
                        <img
                          src={listing?.photos[0]}
                          alt="Listing houses"
                          className=" aspect-[16/10] object-cover w-16 rounded"
                        />
                        <p className=" text-sm text-[#222222] font-semibold w-[200px] truncate">
                          {listing?.title}
                        </p>
                      </td>
                      {/* status */}
                      <td className=" px-6 py-4 w-[100px]">
                        <div className=" flex felx-row gap-2 items-center">
                          <GrInProgress size={14} />
                          {listing?.status}
                        </div>
                      </td>
                      {/* instance book */}
                      <td className="px-6 py-4 w-[150px]">
                        {listing?.status === "Complete" ? (
                          <div className=" flex flex-row gap-2 items-center">
                            <AiFillCheckCircle size={20} color="#008a05" />
                            <p>On</p>
                          </div>
                        ) : (
                          <div className=" flex flex-row gap-2 items-center">
                            <AiFillCheckCircle size={20} color="#dddddd" />
                            <p>Off</p>
                          </div>
                        )}
                      </td>
                      {/* bedroom */}
                      <td className=" px-6 py-4 w-[100px]">
                        {listing?.floorPlan?.bedrooms}
                      </td>
                      {/* bedsNumber */}
                      <td className=" px-6 py-4 w-[100px]">
                        {listing?.floorPlan?.beds}
                      </td>
                      {/* bathRoomsNumber */}
                      <td className=" px-6 py-4 w-[100px]">
                        {listing?.floorPlan?.bathroomsNumber}
                      </td>
                      {/* location */}
                      <td className=" px-2 py-4 w-[200px]">
                        {listing?.location?.addressLineOne
                          ? listing?.location?.addressLineOne
                          : listing?.location?.addressLineTwo
                          ? listing?.location?.addressLineTwo
                          : listing?.location?.city &&
                            listing?.location?.country?.name}
                      </td>
                      {/* created at */}
                      <td className=" px-6 py-4 max-w-[130px]">
                        {listing?.created_at.split("T")[0]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingTable;
