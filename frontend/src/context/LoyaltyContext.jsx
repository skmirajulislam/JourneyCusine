/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../backend";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";

const LoyaltyContext = createContext();

export const LoyaltyProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchLoyaltyProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get("/loyalty/profile");
      if (res.data?.success === 1) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error("fetchLoyaltyProfile error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLoyaltyProfile();
  }, [fetchLoyaltyProfile]);

  const claimDailyBonus = async () => {
    if (!user) return;
    try {
      setIsClaiming(true);
      const res = await api.post("/loyalty/claim_daily");
      if (res.data?.success === 1) {
        toast.success(res.data.message, { icon: "🎉", duration: 5000 });
        await fetchLoyaltyProfile();
      }
    } catch (err) {
      console.error("claimDailyBonus error:", err);
      toast.error(err.response?.data?.error || "Failed to claim daily bonus");
    } finally {
      setIsClaiming(false);
    }
  };

  const redeemVoucher = async (voucherType) => {
    if (!user) return;
    try {
      const res = await api.post("/loyalty/redeem", { voucherType });
      if (res.data?.success === 1) {
        toast.success(res.data.message, { icon: "🎟️", duration: 6000 });
        await fetchLoyaltyProfile();
        return res.data;
      }
    } catch (err) {
      console.error("redeemVoucher error:", err);
      toast.error(err.response?.data?.error || "Failed to redeem points");
      return null;
    }
  };

  const openPassportModal = () => setIsOpen(true);
  const closePassportModal = () => setIsOpen(false);

  return (
    <LoyaltyContext.Provider
      value={{
        profile,
        isOpen,
        isLoading,
        isClaiming,
        openPassportModal,
        closePassportModal,
        claimDailyBonus,
        redeemVoucher,
        refreshLoyaltyProfile: fetchLoyaltyProfile,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error("useLoyalty must be used within a LoyaltyProvider");
  }
  return context;
};
