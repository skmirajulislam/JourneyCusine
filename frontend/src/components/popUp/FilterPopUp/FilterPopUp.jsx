import React, { useState, useEffect, useMemo } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { HiOutlineWifi } from "react-icons/hi";
import { PiTelevisionSimple } from "react-icons/pi";
import { MdOutlineKitchen, MdOutlinePool } from "react-icons/md";
import { BiSolidWasher } from "react-icons/bi";
import { AiOutlineCar } from "react-icons/ai";
import { BsSnow, BsPersonWorkspace } from "react-icons/bs";
import { GiBathtub, GiBarbecue } from "react-icons/gi";
import { CiDumbbell } from "react-icons/ci";

export const PRICE_OPTIONS = [
  { id: "all", label: "Any price", min: 0, max: Infinity },
  { id: "under100", label: "Under $100 / night", min: 0, max: 100 },
  { id: "100to250", label: "$100 - $250 / night", min: 100, max: 250 },
  { id: "250to500", label: "$250 - $500 / night", min: 250, max: 500 },
  { id: "500plus", label: "$500+ / night", min: 500, max: Infinity },
];

export const RATING_OPTIONS = [
  { id: "all", label: "Any rating", minRating: 0 },
  { id: "4.5", label: "4.5 & above", minRating: 4.5, desc: "Top rated stays" },
  { id: "4.0", label: "4.0 & above", minRating: 4.0, desc: "Very good" },
  { id: "3.5", label: "3.5 & above", minRating: 3.5, desc: "Good quality" },
];

export const AMENITIES_OPTIONS = [
  { id: "Wifi", label: "Wifi", icon: HiOutlineWifi },
  { id: "TV", label: "TV", icon: PiTelevisionSimple },
  { id: "Kitchen", label: "Kitchen / Fridge", icon: MdOutlineKitchen },
  { id: "Air conditioning", label: "Air conditioning", icon: BsSnow },
  { id: "Pool", label: "Pool", icon: MdOutlinePool },
  { id: "Free parking", label: "Free parking", icon: AiOutlineCar },
  { id: "Washer", label: "Washing machine", icon: BiSolidWasher },
  { id: "Dedicated workspace", label: "Workspace", icon: BsPersonWorkspace },
  { id: "Hot tub", label: "Hot tub", icon: GiBathtub },
  { id: "BBQ grill", label: "BBQ Grill", icon: GiBarbecue },
  { id: "Gym", label: "Gym / Fitness", icon: CiDumbbell },
];

const FilterPopUp = ({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
  totalMatchingCount = 0,
}) => {
  const [selectedPrice, setSelectedPrice] = useState(activeFilters.price || "all");
  const [selectedRating, setSelectedRating] = useState(activeFilters.rating || "all");
  const [selectedAmenities, setSelectedAmenities] = useState(activeFilters.amenities || []);

  useEffect(() => {
    if (isOpen) {
      setSelectedPrice(activeFilters.price || "all");
      setSelectedRating(activeFilters.rating || "all");
      setSelectedAmenities(activeFilters.amenities || []);
    }
  }, [isOpen, activeFilters]);

  const handleToggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setSelectedPrice("all");
    setSelectedRating("all");
    setSelectedAmenities([]);
    onApplyFilters({
      price: "all",
      rating: "all",
      amenities: [],
    });
    onClose();
  };

  const handleApply = () => {
    onApplyFilters({
      price: selectedPrice,
      rating: selectedRating,
      amenities: selectedAmenities,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#eeeeee] dark:border-[#333333] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#eeeeee] dark:border-[#2e2e2e] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md z-10">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#717171] dark:text-[#a0a0a0] transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
          <h2 className="text-lg font-bold text-[#111827] dark:text-white">
            Filters
          </h2>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-[#717171] hover:text-[#ff385c] dark:text-[#a0a0a0] dark:hover:text-[#ff385c] underline transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="p-6 overflow-y-auto space-y-7 flex-1">
          {/* 1. Price Filter (Radio Basis) */}
          <div>
            <h3 className="text-sm font-extrabold text-[#111827] dark:text-white mb-3">
              Price Range
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRICE_OPTIONS.map((opt) => {
                const isSelected = selectedPrice === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#ff385c] bg-[#ff385c]/5 dark:bg-[#ff385c]/10 text-[#111827] dark:text-white font-bold ring-1 ring-[#ff385c]"
                        : "border-[#e5e7eb] dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-[#374151] dark:text-[#d1d5db]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceFilter"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setSelectedPrice(opt.id)}
                      className="accent-[#ff385c] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <hr className="border-[#eeeeee] dark:border-[#2e2e2e]" />

          {/* 2. Rating Filter (Radio Basis) */}
          <div>
            <h3 className="text-sm font-extrabold text-[#111827] dark:text-white mb-3">
              Guest Rating
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RATING_OPTIONS.map((opt) => {
                const isSelected = selectedRating === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#ff385c] bg-[#ff385c]/5 dark:bg-[#ff385c]/10 text-[#111827] dark:text-white font-bold ring-1 ring-[#ff385c]"
                        : "border-[#e5e7eb] dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-[#374151] dark:text-[#d1d5db]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="ratingFilter"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setSelectedRating(opt.id)}
                        className="accent-[#ff385c] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm flex items-center gap-1">
                        {opt.minRating > 0 && <AiFillStar className="text-amber-500" size={15} />}
                        {opt.label}
                      </span>
                    </div>
                    {opt.desc && (
                      <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
                        {opt.desc}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <hr className="border-[#eeeeee] dark:border-[#2e2e2e]" />

          {/* 3. Amenities / Accessories (Checkmark Basis) */}
          <div>
            <h3 className="text-sm font-extrabold text-[#111827] dark:text-white mb-1">
              Amenities &amp; Accessories
            </h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-3">
              Select all features you want included in your stay
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AMENITIES_OPTIONS.map((opt) => {
                const isChecked = selectedAmenities.includes(opt.id);
                const IconComponent = opt.icon;

                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => handleToggleAmenity(opt.id)}
                    className={`flex flex-col items-start justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isChecked
                        ? "border-[#ff385c] bg-[#ff385c]/5 dark:bg-[#ff385c]/15 text-[#111827] dark:text-white font-bold ring-1.5 ring-[#ff385c]"
                        : "border-[#e5e7eb] dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-[#374151] dark:text-[#d1d5db]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <IconComponent size={20} className={isChecked ? "text-[#ff385c]" : "text-[#6b7280]"} />
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-[#ff385c] text-white"
                            : "border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                        }`}
                      >
                        {isChecked && <FiCheck size={13} />}
                      </div>
                    </div>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#eeeeee] dark:border-[#2e2e2e] flex items-center justify-between bg-white dark:bg-[#1e1e1e] sticky bottom-0 z-10">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-3 rounded-2xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopUp;
