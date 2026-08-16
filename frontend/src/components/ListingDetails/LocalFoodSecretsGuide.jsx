import { motion } from "framer-motion";
import {
  FiMapPin,
  FiCompass,
  FiStar,
  FiExternalLink,
  FiPlus,
  FiEdit2,
} from "react-icons/fi";
import { IoFastFoodOutline, IoWineOutline } from "react-icons/io5";
import { MdOutlineBakeryDining, MdOutlineRestaurant, MdLocalCafe } from "react-icons/md";
import { Badge } from "@/components/ui/badge";

const CATEGORY_ICONS = {
  street_food: <IoFastFoodOutline className="w-4 h-4 text-orange-500" />,
  fine_dining: <MdOutlineRestaurant className="w-4 h-4 text-amber-500" />,
  bakery: <MdOutlineBakeryDining className="w-4 h-4 text-yellow-600" />,
  cafe: <MdLocalCafe className="w-4 h-4 text-emerald-500" />,
  vineyard: <IoWineOutline className="w-4 h-4 text-purple-500" />,
  market: <FiCompass className="w-4 h-4 text-blue-500" />,
  seafood_shack: <FiStar className="w-4 h-4 text-cyan-500" />,
};

const LocalFoodSecretsGuide = ({
  secrets = [],
  hostName = "Host",
  isHost = false,
  onOpenHostEdit,
}) => {
  const hasSecrets = Array.isArray(secrets) && secrets.length > 0;

  // If no secrets exist and the viewer is NOT the host, hide this section
  if (!hasSecrets && !isHost) {
    return null;
  }

  return (
    <section className="mt-12 pt-10 border-t border-[#e5e7eb] dark:border-[#2f2f2f] w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#222222] dark:text-white">
              {hostName}&apos;s Local Food Secrets
            </h3>
          </div>
          <p className="text-sm text-[#717171] dark:text-[#a0a0a0] mt-1">
            Skip tourist traps. Explore authentic neighborhood dining spots recommended directly by your host.
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
              Manage Food Secrets
            </button>
          )}
          <Badge variant="secondary" className="font-semibold px-3 py-1 text-xs">
            Insider Recommendations
          </Badge>
        </div>
      </div>

      {/* Host Empty State Promo Card */}
      {!hasSecrets && isHost ? (
        <div className="p-6 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-[#1f1f1f] text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center mb-3">
            <MdOutlineRestaurant size={24} />
          </div>
          <h4 className="text-base font-bold text-neutral-900 dark:text-white">
            Share your favorite local culinary spots
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
            Recommend hidden cafes, wood-fired bakeries, and street food stalls near your property to create an unforgettable trip for your guests.
          </p>
          {onOpenHostEdit && (
            <button
              type="button"
              onClick={onOpenHostEdit}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-md transition cursor-pointer"
            >
              <FiPlus size={14} /> Add Local Food Secrets from Dashboard
            </button>
          )}
        </div>
      ) : (
        /* Real Host Food Secrets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {secrets.map((secret, idx) => {
            const secretKey = secret._id || `sec_${idx}`;

            return (
              <motion.div
                key={secretKey}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl p-5 bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#333333] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0">
                        {CATEGORY_ICONS[secret.category] || <MdOutlineRestaurant className="w-4 h-4 text-[#ff385c]" />}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#717171] dark:text-[#a0a0a0]">
                          {secret.category?.replace("_", " ")}
                        </span>
                        <h4 className="text-sm font-bold text-[#111827] dark:text-white leading-snug">
                          {secret.name}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[#222222] dark:text-white shrink-0">
                      {secret.priceRange || "$$"}
                    </span>
                  </div>

                  {secret.description && (
                    <p className="text-xs text-[#555555] dark:text-[#a0a0a0] mt-3 leading-relaxed">
                      {secret.description}
                    </p>
                  )}

                  {secret.recommendedDish && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50">
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block uppercase tracking-wider">
                        ✨ Must-Try Signature Dish:
                      </span>
                      <span className="text-xs font-semibold text-amber-950 dark:text-amber-200">
                        {secret.recommendedDish}
                      </span>
                    </div>
                  )}
                </div>

                {secret.address && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-[#717171] dark:text-[#a0a0a0]">
                    <span className="flex items-center gap-1 truncate">
                      <FiMapPin size={13} className="shrink-0 text-[#ff385c]" />
                      <span className="truncate">{secret.address}</span>
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${secret.name} ${secret.address}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 font-semibold text-[#ff385c] hover:underline shrink-0 ml-2"
                    >
                      Map
                      <FiExternalLink size={11} />
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default LocalFoodSecretsGuide;
