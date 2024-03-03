import { Link } from "react-router-dom";

/* eslint-disable react/prop-types */
const UpcomingReservation = ({ data }) => {
  return (
    <div className="flex flex-col overflow-x-auto">
      <div className="">
        <div className="inline-block min-w-full py-2">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm font-light">
              <thead className=" text-xs text-[#717171] font-medium border-b border-[#dddddd]">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    S.NO
                  </th>
                  <th scope="col" className="px-6 py-4">
                    ORDER ID
                  </th>
                  <th scope="col" className="px-6 py-4">
                    LISTING
                  </th>
                  <th scope="col" className="px-6 py-4">
                    GUEST
                  </th>
                  <th scope="col" className="px-6 py-4">
                    NIGHT
                  </th>
                  <th scope="col" className="px-6 py-4">
                    EARNED
                  </th>
                  <th scope="col" className="px-6 py-4">
                    CHECK IN
                  </th>
                  <th scope="col" className="px-6 py-4">
                    CHECK OUT
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.map((listing, i, arr) => {
                  const checkIn = new Date(
                    listing.checkIn
                  ).toLocaleDateString();
                  const checkOut = new Date(
                    listing.checkOut
                  ).toLocaleDateString();
                  return (
                    <tr
                      key={i}
                      className={`${
                        i === arr.length - 1 ? "" : "border-b border-[#dddddd]"
                      }`}
                    >
                      {/* serial */}
                      <td className=" px-6 py-4 w-[120px]">
                        <p className="text-sm text-[#222222]">{i + 1}</p>
                      </td>
                      {/* see listing btn */}
                      <td className=" px-6 py-4 flex flex-row items-center gap-2">
                        <p className="text-sm text-[#222222]">
                          {listing.orderId}
                        </p>
                      </td>
                      {/* order id*/}
                      <td className=" px-6 py-4 w-[120px]">
                        <Link
                          to={`/rooms/${listing.listingId}`}
                          className=" text-sm text-[#222222] font-medium w-[120px] underline hover:text-blue-500 transition-colors duration-200 ease-in"
                        >
                          See listing
                        </Link>
                      </td>
                      {/* guest number */}
                      <td className=" px-6 py-4 w-[120px]">
                        <p className="text-sm text-[#222222]">
                          {listing.guestNumber}
                        </p>
                      </td>
                      {/* night staying */}
                      <td className=" px-6 py-4 w-[120px]">
                        <p className="text-sm text-[#222222]">
                          {listing.nightStaying}
                        </p>
                      </td>
                      {/* author earned */}
                      <td className=" px-6 py-4 w-[120px]">
                        <p className="text-sm text-[#222222]">
                          ${listing.authorEarnedPrice}
                        </p>
                      </td>
                      {/* check in */}
                      <td className=" px-6 py-4 w-[120px]">
                        <p className="text-sm text-[#222222]">{checkIn}</p>
                      </td>
                      {/* check out */}
                      <td className=" px-6 py-4 w-[120px]">
                        <p className="text-sm text-[#222222]">{checkOut}</p>
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

export default UpcomingReservation;
