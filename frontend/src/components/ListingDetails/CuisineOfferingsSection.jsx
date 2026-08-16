import { motion } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";
import {
  FiCoffee,
  FiAward,
  FiCheck,
  FiPlus,
  FiEdit2,
} from "react-icons/fi";
import { IoRestaurantOutline, IoWineOutline } from "react-icons/io5";
import { MdOutlineDinnerDining, MdOutlineBakeryDining } from "react-icons/md";
import { Badge } from "@/components/ui/badge";

const TYPE_ICONS = {
  breakfast: <FiCoffee className="w-5 h-5 text-amber-500" />,
  lunch: <IoRestaurantOutline className="w-5 h-5 text-emerald-500" />,
  dinner: <MdOutlineDinnerDining className="w-5 h-5 text-rose-500" />,
  chef_experience: <FiAward className="w-5 h-5 text-purple-500" />,
  cooking_class: <MdOutlineBakeryDining className="w-5 h-5 text-orange-500" />,
  wine_tasting: <IoWineOutline className="w-5 h-5 text-red-500" />,
  snack_platter: <FiCoffee className="w-5 h-5 text-teal-500" />,
};

const DIETARY_LABELS = {
  vegetarian: { label: "Vegetarian", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  vegan: { label: "100% Vegan", color: "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200 dark:border-green-800" },
  halal: { label: "Halal Certified", color: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  kosher: { label: "Kosher Friendly", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  gluten_free: { label: "Gluten-Free", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  organic: { label: "Farm-to-Table Organic", color: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800" },
};

const CuisineOfferingsSection = ({
  offerings = [],
  selectedAddons = [],
  onToggleAddon,
  guestCount = 1,
  isHost = false,
  onOpenHostEdit,
}) => {
  const { formatPrice } = useCurrency();

  const hasOfferings = Array.isArray(offerings) && offerings.length > 0;

  // If no offerings exist and the viewer is NOT the host, don't display empty section
  if (!hasOfferings && !isHost) {
    return null;
  }

  return (
    <section className="mt-12 pt-10 border-t border-[#e5e7eb] dark:border-[#2f2f2f] w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍲</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#222222] dark:text-white">
              Cuisine &amp; Dining Experiences
            </h3>
          </div>
          <p className="text-sm text-[#717171] dark:text-[#a0a0a0] mt-1">
            Authentic dining experiences prepared by your host. Select optional meal add-ons for your stay.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isHost && onOpenHostEdit && (
            <button
              type="button"
              onClick={onOpenHostEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-white transition cursor-pointer"
            >
              <FiEdit2 size={12} />
              Manage Dishes
            </button>
          )}
          <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/40 text-[#ff385c] border-rose-200 dark:border-rose-900 font-semibold px-3 py-1 text-xs">
            Exclusive to Journey Cuisine
          </Badge>
        </div>
      </div>

      {/* Host Empty State Promo Card */}
      {!hasOfferings && isHost ? (
        <div className="p-6 rounded-3xl border border-dashed border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-[#ff385c] flex items-center justify-center mb-3">
            <FiCoffee size={24} />
          </div>
          <h4 className="text-base font-bold text-neutral-900 dark:text-white">
            You haven&apos;t added any dining experiences yet
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
            Earn extra income by offering homemade breakfast, authentic regional dinners, or cooking masterclasses to your guests.
          </p>
          {onOpenHostEdit && (
            <button
              type="button"
              onClick={onOpenHostEdit}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <FiPlus size={14} /> Add Dining Offerings from Dashboard
            </button>
          )}
        </div>
      ) : (
        /* Real Host Offerings Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offerings.map((item, idx) => {
            const itemKey = item._id || `offering_${idx}`;
            const isSelected = selectedAddons.some(
              (a) => a.offeringId === itemKey || a.title === item.title
            );
            const currentAddon = selectedAddons.find(
              (a) => a.offeringId === itemKey || a.title === item.title
            );
            const quantity = currentAddon?.quantity || guestCount;

            return (
              <motion.div
                key={itemKey}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-rose-50/40 dark:bg-rose-950/20 border-[#ff385c] ring-1 ring-[#ff385c]"
                    : "bg-white dark:bg-[#1f1f1f] border-[#e5e7eb] dark:border-[#333333] hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                <div>
                  {/* Header with Type & Price */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0">
                        {TYPE_ICONS[item.type] || <IoRestaurantOutline className="w-5 h-5 text-[#ff385c]" />}
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#717171] dark:text-[#a0a0a0]">
                          {item.type?.replace("_", " ")}
                        </span>
                        <h4 className="text-base font-bold text-[#222222] dark:text-white leading-snug">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-[#555555] dark:text-[#b0b0b0] mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Dietary Tags */}
                  {Array.isArray(item.dietary) && item.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.dietary.map((tag) => {
                        const meta = DIETARY_LABELS[tag] || {
                          label: tag,
                          color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
                        };
                        return (
                          <span
                            key={tag}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Price & Selection Action */}
                <div className="mt-5 pt-4 border-t border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#222222] dark:text-white">
                      {formatPrice(item.price)}
                      <span className="text-[11px] font-normal text-[#717171] dark:text-[#a0a0a0]">
                        {" "}/ guest
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-[#ff385c] font-semibold">
                        Total: {formatPrice(item.price * quantity)}
                      </span>
                    )}
                  </div>

                  {onToggleAddon && (
                    <button
                      type="button"
                      onClick={() =>
                        onToggleAddon({
                          offeringId: itemKey,
                          title: item.title,
                          price: item.price,
                          type: item.type,
                          quantity,
                        })
                      }
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isSelected
                          ? "bg-[#ff385c] text-white hover:bg-[#d90b63]"
                          : "bg-neutral-100 dark:bg-neutral-800 text-[#222222] dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <FiCheck size={13} />
                          Added
                        </>
                      ) : (
                        <>
                          <FiPlus size={13} />
                          Add to Stay
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CuisineOfferingsSection;
