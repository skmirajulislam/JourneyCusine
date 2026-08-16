import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { AiFillStar } from "react-icons/ai";
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

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const FilterPopUp = ({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#eeeeee] dark:border-[#333333] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#eeeeee] dark:border-[#2e2e2e] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md z-10">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="rounded-full text-[#717171] dark:text-[#a0a0a0]"
              >
                <X size={20} />
              </Button>
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
              {/* 1. Price Filter */}
              <div>
                <h3 className="text-sm font-extrabold text-[#111827] dark:text-white mb-3">
                  Price Range
                </h3>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                >
                  {PRICE_OPTIONS.map((opt) => {
                    const isSelected = selectedPrice === opt.id;
                    return (
                      <motion.label
                        key={opt.id}
                        variants={staggerItem}
                        whileTap={{ scale: 0.98 }}
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
                      </motion.label>
                    );
                  })}
                </motion.div>
              </div>

              <Separator />

              {/* 2. Rating Filter */}
              <div>
                <h3 className="text-sm font-extrabold text-[#111827] dark:text-white mb-3">
                  Guest Rating
                </h3>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                >
                  {RATING_OPTIONS.map((opt) => {
                    const isSelected = selectedRating === opt.id;
                    return (
                      <motion.label
                        key={opt.id}
                        variants={staggerItem}
                        whileTap={{ scale: 0.98 }}
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
                      </motion.label>
                    );
                  })}
                </motion.div>
              </div>

              <Separator />

              {/* 3. Amenities */}
              <div>
                <h3 className="text-sm font-extrabold text-[#111827] dark:text-white mb-1">
                  Amenities &amp; Accessories
                </h3>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-3">
                  Select all features you want included in your stay
                </p>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                >
                  {AMENITIES_OPTIONS.map((opt) => {
                    const isChecked = selectedAmenities.includes(opt.id);
                    const IconComponent = opt.icon;

                    return (
                      <motion.button
                        type="button"
                        key={opt.id}
                        variants={staggerItem}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleToggleAmenity(opt.id)}
                        className={`flex flex-col items-start justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? "border-[#ff385c] bg-[#ff385c]/5 dark:bg-[#ff385c]/15 text-[#111827] dark:text-white font-bold ring-1.5 ring-[#ff385c]"
                            : "border-[#e5e7eb] dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-[#374151] dark:text-[#d1d5db]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <IconComponent size={20} className={isChecked ? "text-[#ff385c]" : "text-[#6b7280]"} />
                          <motion.div
                            animate={isChecked ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-[#ff385c] text-white"
                                : "border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                            }`}
                          >
                            {isChecked && <Check size={13} />}
                          </motion.div>
                        </div>
                        <span className="text-xs font-semibold">{opt.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#eeeeee] dark:border-[#2e2e2e] flex items-center justify-between bg-white dark:bg-[#1e1e1e] sticky bottom-0 z-10">
              <Button
                type="button"
                onClick={handleClearAll}
                variant="ghost"
                className="font-semibold"
              >
                Clear all
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                variant="journey"
                className="px-6 py-3 rounded-2xl shadow-md hover:shadow-lg"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterPopUp;
