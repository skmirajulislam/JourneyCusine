import { useState } from "react";
import { Link } from "react-router-dom";
import { GrInProgress } from "react-icons/gr";
import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
import { FiEdit2, FiTrash2, FiPlus, FiHome } from "react-icons/fi";
import EditListingModal from "./EditListingModal";
import DeleteListingModal from "./DeleteListingModal";
import { useHostData } from "../../../hooks/useHostData";

const ListingTable = () => {
  const { hostHouses: allListingsData = [] } = useHostData();
  const [editingListing, setEditingListing] = useState(null);
  const [deletingListing, setDeletingListing] = useState(null);

  if (allListingsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#181818] text-center shadow-xs">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#ff385c] mb-3">
          <FiHome size={32} />
        </div>
        <h3 className="text-lg font-bold text-[#111827] dark:text-white">
          No motel listings yet
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mb-5">
          You haven&rsquo;t created any motel listings yet. Start hosting your place on Motel today!
        </p>
        <Link
          to="/become-a-host"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <FiPlus size={16} /> Create your first listing
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col overflow-x-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-sm">
        <div className="inline-block min-w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1e1e1e]">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    LISTING
                  </th>
                  <th scope="col" className="px-6 py-4">
                    STATUS
                  </th>
                  <th scope="col" className="px-6 py-4">
                    PRICE
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
                  <th scope="col" className="px-6 py-4 text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allListingsData.map((listing, i) => {
                  return (
                    <tr
                      key={listing._id || i}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      {/* Image & Title */}
                      <td className="px-6 py-4">
                        <div
                          className="flex flex-row items-center gap-3 cursor-pointer group"
                          onClick={() => setEditingListing(listing)}
                          title="Click to edit listing details"
                        >
                          {listing?.photos?.[0] ? (
                            <img
                              src={listing.photos[0]}
                              alt={listing?.title || "Listing photo"}
                              className="aspect-[16/10] object-cover w-16 h-11 rounded-xl shrink-0 border border-neutral-200 dark:border-neutral-700 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="aspect-[16/10] w-16 h-11 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-500 shrink-0 font-medium">
                              No img
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-[#111827] dark:text-white font-bold w-[180px] sm:w-[220px] truncate group-hover:text-[#ff385c] dark:group-hover:text-[#ff385c] transition-colors">
                              {listing?.title || "Untitled listing"}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                              {listing?.houseType || "Motel"} • {listing?.privacyType || "Entire place"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 w-[130px] text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {["Complete", "published", "Live"].includes(listing?.status) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold">
                            <AiFillCheckCircle size={14} /> Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold">
                            <GrInProgress size={12} /> In progress
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 w-[110px] text-xs font-bold text-[#111827] dark:text-white">
                        ${listing?.basePrice || 50}
                        <span className="font-normal text-[11px] text-neutral-500 dark:text-neutral-400"> /night</span>
                      </td>

                      {/* Instant Book */}
                      <td className="px-6 py-4 w-[130px]">
                        {["Complete", "published", "Live"].includes(listing?.status) ? (
                          <div className="flex flex-row gap-1.5 items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <AiFillCheckCircle size={16} />
                            <span>On</span>
                          </div>
                        ) : (
                          <div className="flex flex-row gap-1.5 items-center text-xs font-bold text-neutral-400 dark:text-neutral-500">
                            <AiFillCloseCircle size={16} />
                            <span>Off</span>
                          </div>
                        )}
                      </td>

                      {/* Bedrooms */}
                      <td className="px-6 py-4 w-[90px] text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {listing?.floorPlan?.bedrooms || 0}
                      </td>

                      {/* Beds */}
                      <td className="px-6 py-4 w-[90px] text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {listing?.floorPlan?.beds || 0}
                      </td>

                      {/* Baths */}
                      <td className="px-6 py-4 w-[90px] text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {listing?.floorPlan?.bathroomsNumber || 0}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 w-[180px] text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        <p className="truncate w-[160px]">
                          {listing?.location?.city?.name
                            ? `${listing?.location?.city?.name}, ${listing?.location?.country?.name || ""}`
                            : listing?.location?.addressLineOne || listing?.location?.country?.name || "Global location"}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 w-[140px]">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingListing(listing)}
                            title="Edit Listing"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-[#111827] dark:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <FiEdit2 size={13} className="text-[#ff385c]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingListing(listing)}
                            title="Delete Listing"
                            className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Listing Modal */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
        />
      )}

      {/* Delete Listing Confirmation Modal */}
      {deletingListing && (
        <DeleteListingModal
          listing={deletingListing}
          onClose={() => setDeletingListing(null)}
        />
      )}
    </>
  );
};

export default ListingTable;
