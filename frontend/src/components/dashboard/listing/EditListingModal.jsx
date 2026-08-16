import { useState } from "react";
import { FiX, FiTrash2, FiPlus, FiCheck } from "react-icons/fi";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { PulseLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../backend";

const AVAILABLE_AMENITIES = [
  "Wifi",
  "TV",
  "Kitchen",
  "Washer",
  "Free parking on premises",
  "Paid parking on premises",
  "Air conditioning",
  "Dedicated workspace",
  "Pool",
  "Hot tub",
  "Patio",
  "BBQ grill",
  "Outdoor dining area",
  "Fire pit",
  "Pool table",
  "Indoor fireplace",
  "Piano",
  "Exercise equipment",
  "Lake access",
  "Beach access",
  "Ski-in/Ski-out",
  "Outdoor shower",
  "Smoke alarm",
  "First aid kit",
  "Fire extinguisher",
  "Carbon monoxide alarm",
];

const HOUSE_TYPES = [
  "House",
  "Apartment",
  "Barn",
  "Bed & breakfast",
  "Boat",
  "Cabin",
  "Camper",
  "Casa particular",
  "Castle",
  "Cave",
  "Container",
  "Cycladic home",
  "Dammuso",
  "Dome",
  "Earth home",
  "Farm",
  "Guesthouse",
  "Hotel",
  "Houseboat",
  "Kezhan",
  "Minsu",
  "Riad",
  "Ryokan",
  "Shepherd’s hut",
  "Tent",
  "Tiny home",
  "Tower",
  "Treehouse",
  "Trullo",
  "Windmill",
  "Yurt",
];

const EditListingModal = ({ listing, onClose }) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState(listing?.title || "");
  const [description, setDescription] = useState(listing?.description || "");
  const [houseType, setHouseType] = useState(listing?.houseType || "House");
  const [privacyType, setPrivacyType] = useState(listing?.privacyType || "An entire place");
  const [status, setStatus] = useState(listing?.status || "In progress");
  const [basePrice, setBasePrice] = useState(listing?.basePrice || 50);

  // Floor plan
  const [guests, setGuests] = useState(listing?.floorPlan?.guests || 1);
  const [bedrooms, setBedrooms] = useState(listing?.floorPlan?.bedrooms || 1);
  const [beds, setBeds] = useState(listing?.floorPlan?.beds || 1);
  const [bathroomsNumber, setBathroomsNumber] = useState(listing?.floorPlan?.bathroomsNumber || 1);

  // Amenities
  const [amenities, setAmenities] = useState(() => {
    if (Array.isArray(listing?.amenities)) {
      return listing.amenities.map((a) => (typeof a === "object" ? a.name || a.title : a)).filter(Boolean);
    }
    return [];
  });

  // Photos
  const [photos, setPhotos] = useState(() => {
    return Array.isArray(listing?.photos) ? [...listing.photos] : [];
  });
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const handleToggleAmenity = (amenityName) => {
    if (amenities.includes(amenityName)) {
      setAmenities(amenities.filter((a) => a !== amenityName));
    } else {
      setAmenities([...amenities, amenityName]);
    }
  };

  const handleAddPhoto = () => {
    const trimmed = newPhotoUrl.trim();
    if (!trimmed) return;
    if (photos.includes(trimmed)) {
      toast.error("Photo URL already added");
      return;
    }
    setPhotos([...photos, trimmed]);
    setNewPhotoUrl("");
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a listing title");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        houseType,
        privacyType,
        status,
        basePrice: Number(basePrice) || 50,
        floorPlan: {
          guests: Number(guests) || 1,
          bedrooms: Number(bedrooms) || 1,
          beds: Number(beds) || 1,
          bathroomsNumber: Number(bathroomsNumber) || 1,
        },
        amenities,
        photos,
      };

      const res = await api.put(`/house/update_listing/${listing._id}`, payload);
      if (res.data?.success === 1) {
        toast.success("Listing updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["hostHouses"] });
        queryClient.invalidateQueries({ queryKey: ["allListing"] });
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to update listing");
      }
    } catch (err) {
      console.error("Save listing error:", err);
      toast.error("Error saving listing changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-[#1e1e1e] z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white">
              Edit Motel Listing
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Update photos, facilities, amenities, pricing and description
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Title & House Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-1.5">
                Listing Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Sunset Beach Villa"
                required
                className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-1.5">
                Category / Property Type
              </label>
              <select
                value={houseType}
                onChange={(e) => setHouseType(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
              >
                {HOUSE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Privacy & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-1.5">
                Privacy Type
              </label>
              <select
                value={privacyType}
                onChange={(e) => setPrivacyType(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
              >
                <option value="An entire place">An entire place</option>
                <option value="A room">A private room</option>
                <option value="A shared room">A shared room</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-1.5">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
              >
                <option value="Complete">Complete (Live on Marketplace)</option>
                <option value="In progress">In progress (Draft mode)</option>
              </select>
            </div>
          </div>

          {/* Price per night */}
          <div>
            <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-1.5">
              Base Price (USD / night) *
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3.5 top-3 text-neutral-500 font-bold">$</span>
              <input
                type="number"
                min="10"
                max="10000"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c] font-semibold"
              />
            </div>
          </div>

          <hr className="border-t border-neutral-200 dark:border-neutral-800" />

          {/* Floor Plan Counters */}
          <div>
            <h3 className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-3">
              Rooms &amp; Space Capacity
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Guests */}
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#252525] flex flex-col items-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Guests</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="p-1 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
                  >
                    <AiOutlineMinus size={12} />
                  </button>
                  <span className="font-bold text-[#111827] dark:text-white w-5 text-center">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests(guests + 1)}
                    className="p-1 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
                  >
                    <AiOutlinePlus size={12} />
                  </button>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#252525] flex flex-col items-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Bedrooms</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                    className="p-1 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
                  >
                    <AiOutlineMinus size={12} />
                  </button>
                  <span className="font-bold text-[#111827] dark:text-white w-5 text-center">{bedrooms}</span>
                  <button
                    type="button"
                    onClick={() => setBedrooms(bedrooms + 1)}
                    className="p-1 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
                  >
                    <AiOutlinePlus size={12} />
                  </button>
                </div>
              </div>

              {/* Beds */}
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#252525] flex flex-col items-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Beds</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBeds(Math.max(1, beds - 1))}
                    className="p-1 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
                  >
                    <AiOutlineMinus size={12} />
                  </button>
                  <span className="font-bold text-[#111827] dark:text-white w-5 text-center">{beds}</span>
                  <button
                    type="button"
                    onClick={() => setBeds(beds + 1)}
                    className="p-1 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
                  >
                    <AiOutlinePlus size={12} />
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#252525] flex flex-col items-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Bathrooms</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBathroomsNumber(Math.max(1, bathroomsNumber - 1))}
                    className="p-1 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
                  >
                    <AiOutlineMinus size={12} />
                  </button>
                  <span className="font-bold text-[#111827] dark:text-white w-5 text-center">{bathroomsNumber}</span>
                  <button
                    type="button"
                    onClick={() => setBathroomsNumber(bathroomsNumber + 1)}
                    className="p-1 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
                  >
                    <AiOutlinePlus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-t border-neutral-200 dark:border-neutral-800" />

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell guests about your motel space, views, ambiance, and location..."
              className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c] leading-relaxed"
            />
          </div>

          <hr className="border-t border-neutral-200 dark:border-neutral-800" />

          {/* Amenities & Facilities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                Facilities &amp; Amenities ({amenities.length} selected)
              </label>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto p-1">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#ff385c] text-white shadow-xs"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    {isSelected && <FiCheck size={13} />}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-t border-neutral-200 dark:border-neutral-800" />

          {/* Photos / Images */}
          <div>
            <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-2">
              Motel Photos ({photos.length})
            </label>

            {/* Existing photos preview grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <img src={url} alt={`Listing ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-all opacity-90 group-hover:opacity-100 cursor-pointer shadow-sm"
                    title="Remove Photo"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new photo input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Paste new image URL (e.g. https://images.unsplash.com/...)"
                className="flex-1 p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-neutral-800 dark:bg-neutral-700 hover:bg-black dark:hover:bg-neutral-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <FiPlus size={14} /> Add Image
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 sticky bottom-0 bg-white dark:bg-[#1e1e1e] z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[#111827] dark:text-white text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center min-w-[130px]"
          >
            {isSaving ? <PulseLoader color="#ffffff" size={6} margin={3} /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditListingModal;
