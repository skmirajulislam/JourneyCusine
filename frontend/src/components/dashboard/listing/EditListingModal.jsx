import { useState } from "react";
import { FiX, FiTrash2, FiPlus, FiCheck, FiCoffee, FiMapPin } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { IoRestaurantOutline } from "react-icons/io5";
import { PulseLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../backend";

const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  try {
    const trimmed = url.trim();
    if (trimmed.startsWith("/") || trimmed.startsWith("data:image/")) {
      return encodeURI(trimmed);
    }
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return "";
  } catch {
    return "";
  }
};

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

const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
  { id: "gluten_free", label: "Gluten-Free" },
  { id: "organic", label: "Organic / Farm" },
];

const EditListingModal = ({ listing, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general"); // "general" | "cuisine" | "secrets"
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState(listing?.title || "");
  const [description, setDescription] = useState(listing?.description || "");
  const [houseType, setHouseType] = useState(listing?.houseType || "House");
  const [privacyType, setPrivacyType] = useState(listing?.privacyType || "An entire place");
  const [status, setStatus] = useState(() => {
    if (listing?.status === "published" || listing?.status === "Live" || listing?.status === "Complete") {
      return "Complete";
    }
    return listing?.status || "In progress";
  });
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

  // Cuisine Offerings (Add-ons)
  const [cuisineOfferings, setCuisineOfferings] = useState(() => {
    return Array.isArray(listing?.cuisineOfferings) ? [...listing.cuisineOfferings] : [];
  });
  const [newOffering, setNewOffering] = useState({
    title: "",
    description: "",
    price: 15,
    type: "breakfast",
    dietary: ["vegetarian"],
    maxGuests: 6,
  });

  // Local Food Secrets
  const [localFoodSecrets, setLocalFoodSecrets] = useState(() => {
    return Array.isArray(listing?.localFoodSecrets) ? [...listing.localFoodSecrets] : [];
  });
  const [newSecret, setNewSecret] = useState({
    name: "",
    category: "cafe",
    description: "",
    address: "",
    recommendedDish: "",
    priceRange: "$$",
  });

  const handleToggleAmenity = (amenityName) => {
    if (amenities.includes(amenityName)) {
      setAmenities(amenities.filter((a) => a !== amenityName));
    } else {
      setAmenities([...amenities, amenityName]);
    }
  };

  const handleAddPhoto = () => {
    const validated = sanitizeImageUrl(newPhotoUrl);
    if (!validated) {
      toast.error("Please enter a valid HTTP(S) image URL");
      return;
    }
    if (photos.includes(validated)) {
      toast.error("Photo URL already added");
      return;
    }
    setPhotos([...photos, validated]);
    setNewPhotoUrl("");
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, idx) => idx !== index));
  };

  // Cuisine Offering Handlers
  const handleAddOffering = () => {
    if (!newOffering.title.trim()) {
      toast.error("Please enter an experience or meal title");
      return;
    }
    setCuisineOfferings([
      ...cuisineOfferings,
      {
        ...newOffering,
        price: Number(newOffering.price) || 10,
        _id: `off_${Date.now()}`,
      },
    ]);
    setNewOffering({
      title: "",
      description: "",
      price: 15,
      type: "breakfast",
      dietary: ["vegetarian"],
      maxGuests: 6,
    });
    toast.success("Meal experience added!");
  };

  const handleRemoveOffering = (index) => {
    setCuisineOfferings(cuisineOfferings.filter((_, idx) => idx !== index));
  };

  const handleToggleDietary = (dietTag) => {
    setNewOffering((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(dietTag)
        ? prev.dietary.filter((t) => t !== dietTag)
        : [...prev.dietary, dietTag],
    }));
  };

  // Local Food Secret Handlers
  const handleAddSecret = () => {
    if (!newSecret.name.trim()) {
      toast.error("Please enter a spot name");
      return;
    }
    setLocalFoodSecrets([
      ...localFoodSecrets,
      {
        ...newSecret,
        _id: `sec_${Date.now()}`,
      },
    ]);
    setNewSecret({
      name: "",
      category: "cafe",
      description: "",
      address: "",
      recommendedDish: "",
      priceRange: "$$",
    });
    toast.success("Local food recommendation added!");
  };

  const handleRemoveSecret = (index) => {
    setLocalFoodSecrets(localFoodSecrets.filter((_, idx) => idx !== index));
  };

  // AI Generator States
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [aiTone, setAiTone] = useState("culinary");
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [smartPricingData, setSmartPricingData] = useState(null);

  const handleGenerateAIDesc = async () => {
    try {
      setIsGeneratingDesc(true);
      const res = await api.post("/ai/generate_description", {
        title: title || listing?.title || "",
        houseType: houseType || listing?.houseType || "Hotel",
        location: listing?.location || "",
        amenities,
        cuisineOfferings,
        tone: aiTone,
      });

      if (res.data?.success === 1 && res.data.description) {
        setDescription(res.data.description);
        toast.success("AI description updated!");
      } else {
        toast.error("Failed to generate description");
      }
    } catch (err) {
      console.error("AI description error:", err);
      toast.error("Failed to generate AI description");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleCalculateSmartPricing = async () => {
    try {
      setIsCalculatingPrice(true);
      const res = await api.post("/ai/smart_pricing", {
        houseType,
        floorPlan: {
          guests: Number(guests) || 1,
          bedrooms: Number(bedrooms) || 1,
          bathroomsNumber: Number(bathroomsNumber) || 1,
        },
        amenities,
        cuisineOfferings,
      });

      if (res.data?.success === 1 && res.data.pricing) {
        setSmartPricingData(res.data.pricing);
        toast.success("Smart price computed!");
      } else {
        toast.error("Failed to compute pricing");
      }
    } catch (err) {
      console.error("Smart pricing error:", err);
      toast.error("Failed to compute smart pricing");
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
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
        cuisineOfferings,
        localFoodSecrets,
      };

      const res = await api.put(`/house/update_listing/${listing._id}`, payload);
      if (res.data?.success === 1) {
        toast.success("Listing updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["hostHouses"] });
        queryClient.invalidateQueries({ queryKey: ["allListing"] });
        queryClient.invalidateQueries({ queryKey: ["listingDetails", listing._id] });
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
      <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-[#1e1e1e] z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white">
              Edit Motel Listing
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Customize property info, amenities, dining add-ons, and local food guides
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

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 bg-neutral-50/50 dark:bg-[#181818]">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "general"
                ? "border-[#ff385c] text-[#ff385c]"
                : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Overview &amp; Amenities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cuisine")}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "cuisine"
                ? "border-[#ff385c] text-[#ff385c]"
                : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <span>🍲 Dining Add-ons</span>
            {cuisineOfferings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-[#ff385c] dark:bg-rose-950/60 text-[10px]">
                {cuisineOfferings.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("secrets")}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "secrets"
                ? "border-[#ff385c] text-[#ff385c]"
                : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <span>🍽️ Local Food Secrets</span>
            {localFoodSecrets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 text-[10px]">
                {localFoodSecrets.length}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* TAB 1: General & Amenities */}
          {activeTab === "general" && (
            <>
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
                    Publishing Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  >
                    <option value="Complete">Published (Live)</option>
                    <option value="In progress">In progress (Draft)</option>
                    <option value="hidden">Hidden (Paused)</option>
                  </select>
                </div>
              </div>

              {/* Base Nightly Price with AI Smart Pricing */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                    Base Nightly Price (USD $)
                  </label>
                  <button
                    type="button"
                    disabled={isCalculatingPrice}
                    onClick={handleCalculateSmartPricing}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#ff385c] hover:underline cursor-pointer"
                  >
                    {isCalculatingPrice ? (
                      <>
                        <PulseLoader size={4} color="#ff385c" />
                        <span>Computing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>💡 AI Smart Price Suggestion</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="number"
                  min="10"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />

                {/* AI Smart Pricing Suggestion Insight Box */}
                {smartPricingData && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        AI Recommended Rate: ${smartPricingData.recommendedPrice}/night (Range: ${smartPricingData.lowRange} - ${smartPricingData.highRange})
                      </span>
                      <button
                        type="button"
                        onClick={() => setBasePrice(smartPricingData.recommendedPrice)}
                        className="px-2.5 py-1 rounded-lg bg-[#ff385c] text-white font-bold text-[10px] hover:bg-[#d90b63] transition cursor-pointer"
                      >
                        Apply (${smartPricingData.recommendedPrice})
                      </button>
                    </div>
                    <div className="mt-1.5 text-[11px] text-amber-800 dark:text-amber-300/90 space-y-0.5">
                      {smartPricingData.insights?.map((ins, idx) => (
                        <p key={idx}>• {ins}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description with AI Copywriter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                    Description
                  </label>

                  <div className="flex items-center gap-2">
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="text-[10px] py-1 px-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-700 dark:text-neutral-300"
                    >
                      <option value="culinary">🍲 Culinary &amp; Authentic</option>
                      <option value="luxury">💎 Luxury &amp; Serene</option>
                      <option value="cozy">🌿 Cozy &amp; Homestyle</option>
                      <option value="modern">⚡ Modern &amp; Nomadic</option>
                    </select>

                    <button
                      type="button"
                      disabled={isGeneratingDesc}
                      onClick={handleGenerateAIDesc}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ff385c] hover:bg-[#d90b63] disabled:opacity-50 text-white font-bold text-[10px] transition cursor-pointer shadow-2xs"
                    >
                      {isGeneratingDesc ? (
                        <>
                          <PulseLoader size={4} color="#fff" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} />
                          <span>✨ AI Rewrite</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your space, atmosphere, and neighborhood..."
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              {/* Floor Plan Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Guests</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      disabled={guests <= 1}
                      onClick={() => setGuests(guests - 1)}
                      className="p-1 rounded-full border border-neutral-400 disabled:opacity-30 cursor-pointer"
                    >
                      <AiOutlineMinus size={11} />
                    </button>
                    <span className="font-bold">{guests}</span>
                    <button
                      type="button"
                      onClick={() => setGuests(guests + 1)}
                      className="p-1 rounded-full border border-neutral-400 cursor-pointer"
                    >
                      <AiOutlinePlus size={11} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Bedrooms</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      disabled={bedrooms <= 1}
                      onClick={() => setBedrooms(bedrooms - 1)}
                      className="p-1 rounded-full border border-neutral-400 disabled:opacity-30 cursor-pointer"
                    >
                      <AiOutlineMinus size={11} />
                    </button>
                    <span className="font-bold">{bedrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBedrooms(bedrooms + 1)}
                      className="p-1 rounded-full border border-neutral-400 cursor-pointer"
                    >
                      <AiOutlinePlus size={11} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Beds</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      disabled={beds <= 1}
                      onClick={() => setBeds(beds - 1)}
                      className="p-1 rounded-full border border-neutral-400 disabled:opacity-30 cursor-pointer"
                    >
                      <AiOutlineMinus size={11} />
                    </button>
                    <span className="font-bold">{beds}</span>
                    <button
                      type="button"
                      onClick={() => setBeds(beds + 1)}
                      className="p-1 rounded-full border border-neutral-400 cursor-pointer"
                    >
                      <AiOutlinePlus size={11} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Baths</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      disabled={bathroomsNumber <= 1}
                      onClick={() => setBathroomsNumber(bathroomsNumber - 1)}
                      className="p-1 rounded-full border border-neutral-400 disabled:opacity-30 cursor-pointer"
                    >
                      <AiOutlineMinus size={11} />
                    </button>
                    <span className="font-bold">{bathroomsNumber}</span>
                    <button
                      type="button"
                      onClick={() => setBathroomsNumber(bathroomsNumber + 1)}
                      className="p-1 rounded-full border border-neutral-400 cursor-pointer"
                    >
                      <AiOutlinePlus size={11} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-2">
                  Facilities &amp; Amenities ({amenities.length} selected)
                </label>
                <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto p-1">
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

              {/* Photos */}
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider mb-2">
                  Motel Photos ({photos.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <img src={sanitizeImageUrl(url) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"} alt={`Listing ${idx + 1}`} className="w-full h-full object-cover" />
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
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1 p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-xs focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-neutral-800 dark:bg-neutral-700 hover:bg-black text-white font-bold text-xs cursor-pointer"
                  >
                    <FiPlus size={14} /> Add Image
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: Cuisine Offerings */}
          {activeTab === "cuisine" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50">
                <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200 flex items-center gap-2">
                  <FiCoffee className="text-[#ff385c]" />
                  <span>Offer Homemade Meals &amp; Culinary Experiences</span>
                </h4>
                <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-1">
                  Earn extra revenue on every stay by offering authentic home-cooked breakfasts, regional dinners, or cooking masterclasses.
                </p>
              </div>

              {/* Add New Offering Form */}
              <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-[#252525] space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  + Add New Dining Experience
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Experience Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional Tuscan Farmhouse Dinner"
                      value={newOffering.title}
                      onChange={(e) => setNewOffering({ ...newOffering, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Price per Guest (USD $)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={newOffering.price}
                      onChange={(e) => setNewOffering({ ...newOffering, price: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Category
                    </label>
                    <select
                      value={newOffering.type}
                      onChange={(e) => setNewOffering({ ...newOffering, type: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="chef_experience">Private Chef Experience</option>
                      <option value="cooking_class">Cooking Class</option>
                      <option value="wine_tasting">Wine Tasting</option>
                      <option value="snack_platter">Snack Platter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Max Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newOffering.maxGuests}
                      onChange={(e) => setNewOffering({ ...newOffering, maxGuests: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Description &amp; Menu Details
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Describe what dishes and beverages are included..."
                    value={newOffering.description}
                    onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Dietary Accommodations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((opt) => {
                      const isChecked = newOffering.dietary.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleToggleDietary(opt.id)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                            isChecked
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white dark:bg-[#1e1e1e] text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700"
                          }`}
                        >
                          {isChecked && "✓ "}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddOffering}
                  className="px-4 py-2 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FiPlus size={14} /> Add Experience
                </button>
              </div>

              {/* Current Offerings List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Active Dining Offerings ({cuisineOfferings.length})
                </h5>

                {cuisineOfferings.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No custom meal offerings added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {cuisineOfferings.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#252525] flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-neutral-900 dark:text-white">
                              {item.title}
                            </span>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-xs text-[#ff385c]">
                            ${item.price} / guest
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOffering(idx)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Local Food Secrets */}
          {activeTab === "secrets" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50">
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                  <IoRestaurantOutline className="text-amber-600" />
                  <span>Curate Your Neighborhood Food Secrets</span>
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">
                  Share your favorite local bakeries, street stalls, and hidden cafes to create an unforgettable culinary trip for your guests.
                </p>
              </div>

              {/* Add New Secret Form */}
              <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-[#252525] space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  + Add Food Recommendation
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Place / Restaurant Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nonna Rosa's Handcrafted Pasta"
                      value={newSecret.name}
                      onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Category
                    </label>
                    <select
                      value={newSecret.category}
                      onChange={(e) => setNewSecret({ ...newSecret, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    >
                      <option value="cafe">Cafe / Coffee</option>
                      <option value="bakery">Artisan Bakery</option>
                      <option value="street_food">Street Food Stall</option>
                      <option value="fine_dining">Fine Dining / Trattoria</option>
                      <option value="seafood_shack">Seafood Shack</option>
                      <option value="vineyard">Winery / Vineyard</option>
                      <option value="market">Farmers Market</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Recommended Dish to Order
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pistachio Brioche & Espresso"
                      value={newSecret.recommendedDish}
                      onChange={(e) => setNewSecret({ ...newSecret, recommendedDish: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Price Range
                    </label>
                    <select
                      value={newSecret.priceRange}
                      onChange={(e) => setNewSecret({ ...newSecret, priceRange: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    >
                      <option value="$">$ (Budget Friendly)</option>
                      <option value="$$">$$ (Moderate)</option>
                      <option value="$$$">$$$ (Upscale)</option>
                      <option value="$$$$">$$$$ (Fine Dining)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Address / Street Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Harbor Road 12"
                      value={newSecret.address}
                      onChange={(e) => setNewSecret({ ...newSecret, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Host Note / Insider Tip
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Go before 9am for fresh warm pastries"
                      value={newSecret.description}
                      onChange={(e) => setNewSecret({ ...newSecret, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] text-xs focus:ring-2 focus:ring-[#ff385c] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSecret}
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FiPlus size={14} /> Add Food Secret
                </button>
              </div>

              {/* Current Secrets List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Curated Neighborhood Spots ({localFoodSecrets.length})
                </h5>

                {localFoodSecrets.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No food recommendations added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {localFoodSecrets.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#252525] flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-neutral-900 dark:text-white">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                              {item.category} • {item.priceRange}
                            </span>
                          </div>
                          {item.recommendedDish && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                              Must Try: {item.recommendedDish}
                            </p>
                          )}
                          {item.address && (
                            <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                              <FiMapPin size={10} /> {item.address}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSecret(idx)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition cursor-pointer shrink-0"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
