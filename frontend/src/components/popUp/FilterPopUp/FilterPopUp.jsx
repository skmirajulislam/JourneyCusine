/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, SlidersHorizontal } from "lucide-react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { HiOutlineWifi } from "react-icons/hi";
import { PiTelevisionSimple } from "react-icons/pi";
import { MdOutlineKitchen, MdOutlinePool } from "react-icons/md";
import { BiSolidWasher } from "react-icons/bi";
import { AiOutlineCar } from "react-icons/ai";
import { BsSnow, BsPersonWorkspace } from "react-icons/bs";
import { GiBathtub, GiBarbecue } from "react-icons/gi";
import { CiDumbbell } from "react-icons/ci";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/context/CurrencyContext";

export const PRICE_PRESETS = [
  { id: "all", label: "All Prices", min: 0, max: 1000 },
  { id: "budget", label: "Under $100", min: 0, max: 100 },
  { id: "mid", label: "$100 - $300", min: 100, max: 300 },
  { id: "luxury", label: "$300+", min: 300, max: 1000 },
];
export const PRICE_OPTIONS = PRICE_PRESETS;

export const RATING_PRESETS = [
  { id: "0", label: "Any rating", minRating: 0 },
  { id: "3.5", label: "★ 3.5+", minRating: 3.5, desc: "Good" },
  { id: "4.0", label: "★ 4.0+", minRating: 4.0, desc: "Very Good" },
  { id: "4.5", label: "★ 4.5+", minRating: 4.5, desc: "Top Rated" },
  { id: "4.8", label: "★ 4.8+", minRating: 4.8, desc: "Exceptional" },
];
export const RATING_OPTIONS = RATING_PRESETS;

export const AMENITIES_OPTIONS = [
  { id: "Host Meals", label: "🍲 Host Meals & Dining", icon: MdOutlineKitchen },
  { id: "Kitchen", label: "🍳 Chef's Kitchen / Cookware", icon: MdOutlineKitchen },
  { id: "BBQ grill", label: "🥩 BBQ Grill & Oven", icon: GiBarbecue },
  { id: "Wifi", label: "⚡ High-Speed Wifi", icon: HiOutlineWifi },
  { id: "Pool", label: "🏊 Pool", icon: MdOutlinePool },
  { id: "Air conditioning", label: "❄️ Air conditioning", icon: BsSnow },
  { id: "Dedicated workspace", label: "💻 Workspace", icon: BsPersonWorkspace },
  { id: "Free parking", label: "🚗 Free parking", icon: AiOutlineCar },
  { id: "Hot tub", label: "🛁 Hot tub", icon: GiBathtub },
  { id: "TV", label: "📺 TV & Entertainment", icon: PiTelevisionSimple },
  { id: "Washer", label: "🧺 Washing machine", icon: BiSolidWasher },
  { id: "Gym", label: "🏋️ Gym / Fitness", icon: CiDumbbell },
];

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.02 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
};

const FilterPopUp = ({
  isOpen,
  onClose,
  activeFilters = {},
  onApplyFilters,
  totalMatchingCount,
  maxPossiblePrice = 1000,
}) => {
  const { formatPrice, currency } = useCurrency();

  const ceilingPrice = Math.max(10, Math.ceil(maxPossiblePrice));

  const [minPrice, setMinPrice] = useState(() => {
    if (activeFilters.minPrice !== undefined && activeFilters.minPrice !== "") {
      return Math.min(Number(activeFilters.minPrice) || 0, ceilingPrice);
    }
    return 0;
  });

  const [maxPrice, setMaxPrice] = useState(() => {
    if (activeFilters.maxPrice !== undefined && activeFilters.maxPrice !== "") {
      const parsed = Number(activeFilters.maxPrice);
      return isNaN(parsed) || parsed >= ceilingPrice ? ceilingPrice : parsed;
    }
    return ceilingPrice;
  });

  const [minRating, setMinRating] = useState(() => {
    if (activeFilters.minRating !== undefined && activeFilters.minRating !== "") {
      return Number(activeFilters.minRating) || 0;
    }
    if (activeFilters.rating && activeFilters.rating !== "all") {
      return Number(activeFilters.rating) || 0;
    }
    return 0;
  });

  const [selectedAmenities, setSelectedAmenities] = useState(activeFilters.amenities || []);

  useEffect(() => {
    if (isOpen) {
      const minP =
        activeFilters.minPrice !== undefined && activeFilters.minPrice !== ""
          ? Math.min(Number(activeFilters.minPrice) || 0, ceilingPrice)
          : 0;

      const parsedMax =
        activeFilters.maxPrice !== undefined && activeFilters.maxPrice !== ""
          ? Number(activeFilters.maxPrice)
          : ceilingPrice;
      const maxP = isNaN(parsedMax) || parsedMax >= ceilingPrice ? ceilingPrice : parsedMax;

      let r = 0;
      if (activeFilters.minRating !== undefined && activeFilters.minRating !== "") {
        r = Number(activeFilters.minRating) || 0;
      } else if (activeFilters.rating && activeFilters.rating !== "all") {
        r = Number(activeFilters.rating) || 0;
      }

      setMinPrice(minP);
      setMaxPrice(maxP);
      setMinRating(r);
      setSelectedAmenities(activeFilters.amenities || []);
    }
  }, [isOpen, activeFilters, ceilingPrice]);

  const handleToggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setMinPrice(0);
    setMaxPrice(ceilingPrice);
    setMinRating(0);
    setSelectedAmenities([]);
    onApplyFilters({
      minPrice: 0,
      maxPrice: ceilingPrice,
      minRating: 0,
      price: "all",
      rating: "all",
      amenities: [],
    });
    onClose();
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice: Number(minPrice) || 0,
      maxPrice: Number(maxPrice) >= ceilingPrice ? ceilingPrice : Number(maxPrice),
      minRating: Number(minRating) || 0,
      amenities: selectedAmenities,
    });
    onClose();
  };

  const getRatingDescription = (rating) => {
    if (rating >= 4.8) return { label: "Exceptional & Superhost", color: "text-amber-500" };
    if (rating >= 4.5) return { label: "Top Rated Stays", color: "text-amber-500" };
    if (rating >= 4.0) return { label: "Very Good", color: "text-amber-600 dark:text-amber-400" };
    if (rating >= 3.5) return { label: "Good Quality", color: "text-neutral-500 dark:text-neutral-400" };
    if (rating > 0) return { label: "All Rated Stays", color: "text-neutral-500" };
    return { label: "Any Rating (All Stays Included)", color: "text-neutral-400" };
  };

  const ratingDesc = getRatingDescription(minRating);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-[#2e2e2e] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-[#282828] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md z-10">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
              >
                <X size={20} />
              </Button>
              <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#ff385c]" />
                <span>Filters</span>
              </h2>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-neutral-500 hover:text-[#ff385c] dark:text-neutral-400 dark:hover:text-[#ff385c] underline transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* 1. Price Range Slider Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                      Price Range (Per Night)
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Prices dynamically converted to {currency}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-[#ff385c] text-xs font-black">
                    {maxPrice >= ceilingPrice
                      ? `Up to ${formatPrice(ceilingPrice)} / night`
                      : `Up to ${formatPrice(maxPrice)} / night`}
                  </div>
                </div>

                {/* Range Slider Track */}
                <div className="space-y-3 pt-2">
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={ceilingPrice}
                      step={Math.max(1, Math.round(ceilingPrice / 100))}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff385c] focus:outline-hidden"
                    />
                  </div>

                  {/* Range Boundaries in User's Local Currency */}
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 px-0.5">
                    <span>{formatPrice(0)}</span>
                    <span className="text-[#ff385c] font-extrabold">
                      Selected: {formatPrice(maxPrice)}
                    </span>
                    <span>{formatPrice(ceilingPrice)}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-neutral-200 dark:bg-[#2a2a2a]" />

              {/* 2. Rating Range Slider Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                      Guest Rating Slider
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Filter by community reviews and verified guest scores
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1">
                    <AiFillStar size={13} className="text-amber-500" />
                    <span>{minRating > 0 ? `${Number(minRating).toFixed(1)}+` : "Any"}</span>
                  </div>
                </div>

                {/* Rating Slider Track */}
                <div className="space-y-3 pt-2">
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Rating Live Feedback Banner */}
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>
                            {minRating >= star ? (
                              <AiFillStar className="text-amber-400 text-base" />
                            ) : minRating >= star - 0.5 ? (
                              <AiFillStar className="text-amber-300 text-base opacity-75" />
                            ) : (
                              <AiOutlineStar className="text-neutral-300 dark:text-neutral-600 text-base" />
                            )}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {minRating > 0 ? `${Number(minRating).toFixed(1)} & above` : "Any Star Rating"}
                      </span>
                    </div>
                    <span className={`text-[11px] font-semibold ${ratingDesc.color}`}>
                      {ratingDesc.label}
                    </span>
                  </div>

                  {/* Quick Rating Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {RATING_PRESETS.map((preset) => {
                      const isActive = Number(minRating) === preset.minRating;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setMinRating(preset.minRating)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                            isActive
                              ? "bg-amber-500 text-white shadow-xs font-bold"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator className="bg-neutral-200 dark:bg-[#2a2a2a]" />

              {/* 3. Amenities & Accessories */}
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white mb-1">
                  Amenities &amp; Dining
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  Select all experiences and amenities included in your stay
                </p>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {AMENITIES_OPTIONS.map((item) => {
                    const isSelected = selectedAmenities.includes(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        variants={staggerItem}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleToggleAmenity(item.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#ff385c] bg-[#ff385c]/5 dark:bg-[#ff385c]/10 text-neutral-900 dark:text-white font-bold ring-1 ring-[#ff385c]"
                            : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#242424] text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <span className="text-xs font-semibold">{item.label}</span>
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#ff385c] text-white"
                              : "border border-neutral-300 dark:border-neutral-700"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

            </div>

            {/* Footer / Apply Action */}
            <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-[#282828] bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs sm:text-sm font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline cursor-pointer"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-3 rounded-2xl bg-[#ff385c] hover:bg-[#e00b41] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={15} />
                <span>
                  {typeof totalMatchingCount === "number"
                    ? `Show ${totalMatchingCount} Motel${totalMatchingCount === 1 ? "" : "s"}`
                    : "Apply Filters"}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterPopUp;
