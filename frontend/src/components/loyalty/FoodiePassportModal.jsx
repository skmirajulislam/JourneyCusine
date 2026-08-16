import { useState } from "react";
import { useLoyalty } from "../../context/LoyaltyContext";
import {
  FiX,
  FiAward,
  FiCheckCircle,
  FiLock,
  FiCopy,
} from "react-icons/fi";
import { PulseLoader } from "react-spinners";
import { toast } from "react-hot-toast";

const FoodiePassportModal = () => {
  const {
    profile,
    isOpen,
    isClaiming,
    closePassportModal,
    claimDailyBonus,
    redeemVoucher,
  } = useLoyalty();

  const [activeTab, setActiveTab] = useState("passport"); // "passport" | "rewards"
  const [redeemedCode, setRedeemedCode] = useState(null);

  if (!isOpen) return null;

  const points = profile?.points || 0;
  const tierInfo = profile?.tierInfo || {
    tier: "Bronze Epicure",
    discountPercent: 5,
    pointsToNext: 300,
    progressPercent: 40,
  };
  const badges = profile?.badges || [];
  const canClaimDaily = profile?.canClaimDaily ?? true;

  const handleRedeem = async (type) => {
    const res = await redeemVoucher(type);
    if (res?.voucherCode) {
      setRedeemedCode(res.voucherCode);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Voucher code copied to clipboard!");
  };

  return (
    <div
      onClick={closePassportModal}
      className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#181818] rounded-[32px] overflow-hidden shadow-2xl border border-neutral-200 dark:border-[#2e2e2e] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 text-white flex items-start justify-between">
          <div className="pr-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider mb-2">
              <FiAward /> Foodie Passport &amp; Loyalty
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              {tierInfo.tier}
            </h2>
            <p className="text-xs text-white/90 mt-1 max-w-md">
              Earn Gourmet Points on every stay &amp; dining experience. Collect stamps across world cuisines!
            </p>

            {/* Points & Progress Bar */}
            <div className="mt-4 p-3 rounded-2xl bg-black/20 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span>Total Balance: {points} Points</span>
                {tierInfo.nextTier && (
                  <span>
                    {tierInfo.pointsToNext} pts to {tierInfo.nextTier}
                  </span>
                )}
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${tierInfo.progressPercent || 0}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closePassportModal}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Daily Bonus Claim Bar */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Daily Discovery Bonus (+50 pts)
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {canClaimDaily
                  ? "Claim your free daily foodie exploration reward!"
                  : "Bonus already claimed today! Check back tomorrow."}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!canClaimDaily || isClaiming}
            onClick={claimDailyBonus}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
          >
            {isClaiming ? <PulseLoader size={4} color="#fff" /> : "Claim +50 pts"}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-[#2e2e2e] px-6 bg-neutral-50 dark:bg-[#1f1f1f]">
          <button
            type="button"
            onClick={() => setActiveTab("passport")}
            className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer mr-6 ${
              activeTab === "passport"
                ? "border-[#ff385c] text-[#ff385c]"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            🛂 Passport Stamps ({badges.filter((b) => b.isUnlocked).length}/{badges.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rewards")}
            className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "rewards"
                ? "border-[#ff385c] text-[#ff385c]"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            🎟️ Redeem Discounts ({tierInfo.discountPercent}% VIP Perk)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "passport" ? (
            /* Passport Stamp Book Grid */
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Unlock official passport stamps as you book culinary stays, explore local secrets, and earn loyalty points!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {badges.map((badge) => (
                  <div
                    key={badge.badgeId}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      badge.isUnlocked
                        ? "bg-gradient-to-br from-amber-50/60 to-rose-50/40 dark:from-[#221c17] dark:to-[#1f1618] border-amber-300 dark:border-amber-900/60 shadow-xs ring-1 ring-amber-400/30"
                        : "bg-neutral-50 dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2a2a2a] opacity-65"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                        badge.isUnlocked
                          ? "bg-white dark:bg-[#2a221b] border border-amber-300 dark:border-amber-700/50"
                          : "bg-neutral-200 dark:bg-neutral-800 grayscale"
                      }`}
                    >
                      {badge.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-extrabold text-neutral-900 dark:text-white truncate">
                          {badge.name}
                        </h4>
                        {badge.isUnlocked ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-0.5 shrink-0">
                            <FiCheckCircle size={10} /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 font-bold flex items-center gap-0.5 shrink-0">
                            <FiLock size={10} /> {badge.requiredPoints} pts
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                        {badge.description}
                      </p>
                      <span className="text-[10px] font-semibold text-[#ff385c] mt-1.5 block uppercase tracking-wider">
                        {badge.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Rewards Voucher Redemption */
            <div className="space-y-4">
              {redeemedCode && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 animate-slideDown">
                  <div>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      🎉 Voucher Generated Successfully!
                    </p>
                    <p className="text-sm font-mono font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {redeemedCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(redeemedCode)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <FiCopy size={12} /> Copy
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 200 pts -> $10 */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#2e2e2e] text-center flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-black text-neutral-900 dark:text-white">
                      $10 OFF
                    </span>
                    <p className="text-xs text-neutral-500 mt-1">Instant Stay Voucher</p>
                  </div>
                  <button
                    type="button"
                    disabled={points < 200}
                    onClick={() => handleRedeem("discount_10")}
                    className="mt-4 w-full py-2 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Redeem (200 pts)
                  </button>
                </div>

                {/* 500 pts -> $25 */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#2e2e2e] text-center flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-black text-[#ff385c]">
                      $25 OFF
                    </span>
                    <p className="text-xs text-neutral-500 mt-1">Chef Dining &amp; Stays</p>
                  </div>
                  <button
                    type="button"
                    disabled={points < 500}
                    onClick={() => handleRedeem("discount_25")}
                    className="mt-4 w-full py-2 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Redeem (500 pts)
                  </button>
                </div>

                {/* 1000 pts -> $50 */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#2e2e2e] text-center flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      $50 OFF
                    </span>
                    <p className="text-xs text-neutral-500 mt-1">VIP Luxury Retreat</p>
                  </div>
                  <button
                    type="button"
                    disabled={points < 1000}
                    onClick={() => handleRedeem("discount_50")}
                    className="mt-4 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Redeem (1000 pts)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodiePassportModal;
