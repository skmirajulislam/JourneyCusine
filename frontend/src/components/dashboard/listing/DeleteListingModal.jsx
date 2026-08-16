 
import { useState } from "react";
import { FiTrash2, FiAlertTriangle, FiX } from "react-icons/fi";
import { PulseLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../backend";

const DeleteListingModal = ({ listing, onClose }) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!listing?._id) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/house/delete_listing/${listing._id}`);
      if (res.data?.success === 1) {
        toast.success("Listing and associated records deleted permanently");
        queryClient.setQueryData(["hostHouses"], (old) =>
          (old || []).filter((item) => item._id !== listing._id)
        );
        queryClient.invalidateQueries({ queryKey: ["hostHouses"] });
        queryClient.invalidateQueries({ queryKey: ["allListing"] });
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to delete listing");
      }
    } catch (err) {
      console.error("Delete listing error:", err);
      toast.error("Error deleting listing");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1650] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-[#ff385c]">
              <FiAlertTriangle size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-white">
              Delete Motel Listing?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-pointer"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Motel Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 mb-4">
          {listing?.photos?.[0] ? (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="w-14 h-14 object-cover rounded-xl shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-500 shrink-0">
              No img
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#111827] dark:text-white truncate">
              {listing?.title || "Untitled listing"}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {listing?.houseType || "Motel"} • {listing?.location?.city?.name || "Global location"}
            </p>
          </div>
        </div>

        {/* Warning text */}
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
          Are you sure you want to permanently delete this listing? All photos, reservation records,
          and listing data will be completely removed from the database and marketplace.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[#111827] dark:text-white text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 min-w-[130px] justify-center"
          >
            {isDeleting ? (
              <PulseLoader color="#ffffff" size={6} margin={3} />
            ) : (
              <>
                <FiTrash2 size={14} /> Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteListingModal;
