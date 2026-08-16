import { useState, useEffect } from "react";
import api from "../../../backend";
import { toast } from "react-hot-toast";
import {
  FiTag,
  FiPlus,
  FiTrash2,
  FiClock,
  FiUsers,
  FiHome,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { FadeLoader, PulseLoader } from "react-spinners";
import { useCurrency } from "../../../context/CurrencyContext";

const HostCouponsManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [hostListings, setHostListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { symbol } = useCurrency();

  // New Coupon Form state
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountRate: 15,
    maxUsage: 10,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    listingId: "",
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/coupons/my_coupons");
      if (Array.isArray(res.data)) {
        setCoupons(res.data);
      }
    } catch (error) {
      console.error("Error fetching host coupons:", error);
      toast.error("Failed to load discount codes.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHostListings = async () => {
    try {
      const res = await api.get("/house/get_author_houses");
      if (res.data && Array.isArray(res.data.houses)) {
        setHostListings(res.data.houses);
      } else if (Array.isArray(res.data)) {
        setHostListings(res.data);
      }
    } catch (error) {
      console.error("Error fetching host listings:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchHostListings();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.code.trim()) {
      toast.error("Please enter a discount promo code.");
      return;
    }

    if (Number(formData.discountRate) <= 0) {
      toast.error("Discount rate must be greater than 0.");
      return;
    }

    if (formData.discountType === "percentage" && Number(formData.discountRate) > 90) {
      toast.error("Percentage discount cannot exceed 90%.");
      return;
    }

    if (Number(formData.maxUsage) < 1) {
      toast.error("Usage limit must be at least 1.");
      return;
    }

    if (!formData.expiresAt) {
      toast.error("Please select an expiration date & time.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountRate: Number(formData.discountRate),
        maxUsage: Number(formData.maxUsage),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        listingId: formData.listingId || null,
      };

      const res = await api.post("/coupons/create", payload);

      if (res.data?.success) {
        toast.success(res.data?.message || "Discount promo code created!");
        setShowCreateModal(false);
        setFormData({
          code: "",
          discountType: "percentage",
          discountRate: 15,
          maxUsage: 10,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          listingId: "",
        });
        fetchCoupons();
      }
    } catch (error) {
      console.error("Create coupon error:", error);
      toast.error(error.response?.data?.error || "Failed to create discount code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to delete and revoke code "${code}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/coupons/${couponId}`);
      if (res.data?.success) {
        toast.success(`Discount code "${code}" removed!`);
        setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      toast.error(error.response?.data?.error || "Failed to delete discount code.");
    }
  };

  const formatExpiryTime = (expiryDate) => {
    const diff = new Date(expiryDate).getTime() - Date.now();
    if (diff <= 0) return { label: "Expired", isExpired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return { label: `Expires in ${days}d ${hours}h`, isExpired: false };
    }
    return { label: `Expires in ${hours}h`, isExpired: false };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FadeLoader color="#ff385c" height={10} width={3} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header with stats and create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#222222] dark:text-white flex items-center gap-2">
            <FiTag className="text-[#ff385c]" size={22} />
            Motel Discount &amp; Promo Codes
          </h2>
          <p className="text-xs text-[#717171] dark:text-[#a0a0a0] mt-1">
            Issue promotional discounts to attract more guests. Set usage limits and auto-expiration dates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCoupons}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-[#ff385c] transition-colors"
          >
            <FiRefreshCw size={13} /> Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] transition text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            <FiPlus size={16} /> Issue New Discount Code
          </button>
        </div>
      </div>

      {/* Coupon List or Empty State */}
      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dddddd] dark:border-[#333333] bg-[#fafafa] dark:bg-[#1a1a1a] p-10 text-center max-w-lg mx-auto my-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#ff385c] flex items-center justify-center mb-3">
            <FiTag size={26} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No Active Discount Codes
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            You haven&apos;t created any promotional codes yet. Issue a promo code (e.g. 20% off) to share with your guests!
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#222222] dark:bg-white text-white dark:text-[#222222] text-xs font-semibold hover:opacity-90 transition"
          >
            <FiPlus size={14} /> Create Your First Code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon) => {
            const expiryInfo = formatExpiryTime(coupon.expiresAt);
            const usagePercent = Math.min(
              100,
              Math.round((coupon.usageCount / coupon.maxUsage) * 100)
            );
            const isLimitReached = coupon.usageCount >= coupon.maxUsage;

            return (
              <div
                key={coupon._id}
                className="relative rounded-2xl border border-[#e5e7eb] dark:border-[#333333] bg-white dark:bg-[#1e1e1e] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                {/* Top Badge & Code */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#ff385c] border border-rose-200 dark:border-rose-900 tracking-wider">
                      {coupon.code}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        expiryInfo.isExpired || isLimitReached
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {expiryInfo.isExpired
                        ? "Expired"
                        : isLimitReached
                        ? "Fully Used"
                        : "Active"}
                    </span>
                  </div>

                  {/* Discount Rate */}
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountRate}% OFF`
                        : `${symbol}${coupon.discountRate} OFF`}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      ({coupon.discountType} discount)
                    </span>
                  </div>

                  {/* Target Motel Scope */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1.5 truncate">
                    <FiHome className="text-gray-400 shrink-0" size={13} />
                    <span>
                      {coupon.listingId?.title
                        ? `Valid for: ${coupon.listingId.title}`
                        : "Valid for all your motels"}
                    </span>
                  </p>
                </div>

                {/* Middle: Usage & Expiry Details */}
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                  {/* Usage Progress */}
                  <div>
                    <div className="flex justify-between text-gray-500 dark:text-gray-400 mb-1 font-medium text-[11px]">
                      <span className="flex items-center gap-1">
                        <FiUsers size={12} /> Usage
                      </span>
                      <span>
                        <strong>{coupon.usageCount}</strong> / {coupon.maxUsage} used ({usagePercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLimitReached ? "bg-amber-500" : "bg-[#ff385c]"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Expiration timing */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiClock size={12} className="text-[#ff385c]" />
                      {expiryInfo.label}
                    </span>
                    <span>
                      {new Date(coupon.expiresAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Footer Action: Delete / Revoke */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <FiTrash2 size={13} /> Revoke &amp; Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e1e1e] border border-[#dddddd] dark:border-[#444444] rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiTag className="text-[#ff385c]" size={20} />
                Issue New Promo Code
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="mt-5 space-y-4">
              {/* Promo Code Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  PROMO CODE (Letters &amp; Numbers)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25, FESTIVE50, WELCOME"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-900 dark:text-white font-mono uppercase font-bold text-sm focus:outline-none focus:border-[#ff385c]"
                />
              </div>

              {/* Discount Type & Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    DISCOUNT TYPE
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#ff385c]"
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="fixed">Fixed Amount ({symbol}) Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {formData.discountType === "percentage"
                      ? "DISCOUNT RATE (%)"
                      : `DISCOUNT AMOUNT (${symbol})`}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formData.discountType === "percentage" ? "90" : "10000"}
                    value={formData.discountRate}
                    onChange={(e) =>
                      setFormData({ ...formData, discountRate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#ff385c]"
                  />
                </div>
              </div>

              {/* Max Usage Limit & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    MAX USAGE LIMIT (Number of guests)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000"
                    value={formData.maxUsage}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsage: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#ff385c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    EXPIRATION DATE &amp; TIME
                  </label>
                  <input
                    type="datetime-local"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#ff385c]"
                  />
                </div>
              </div>

              {/* Applicable Motel Listing */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  APPLICABLE MOTEL PROPERTY
                </label>
                <select
                  value={formData.listingId}
                  onChange={(e) =>
                    setFormData({ ...formData, listingId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#ff385c]"
                >
                  <option value="">All My Motel Listings</option>
                  {hostListings.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.title || "Motel Listing"} ({symbol}{h.basePrice}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <FiAlertCircle className="shrink-0 mt-0.5 text-blue-600" size={14} />
                <span>
                  Once this coupon reaches its usage limit or crosses its expiration date, it will automatically expire and be removed from the database.
                </span>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] transition text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <PulseLoader size={6} color="#ffffff" />
                  ) : (
                    <>
                      <FiCheckCircle size={14} /> Issue Discount Code
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostCouponsManager;
