const User = require("../models/user.model.js");
const Coupon = require("../models/coupon.model.js");
const { sendNotification } = require("./notificationController.js");

const ALL_PASSPORT_BADGES = [
  {
    badgeId: "ramen_master",
    name: "Ramen & Noodle Master",
    icon: "🍜",
    description: "Explored Asian culinary retreats & authentic noodle masterclasses",
    category: "Asian Cuisine",
    requiredPoints: 100,
  },
  {
    badgeId: "pizza_connoisseur",
    name: "Neapolitan Artisan",
    icon: "🍕",
    description: "Tasted wood-fired authentic pizzas & Italian homestyle stays",
    category: "European Flavors",
    requiredPoints: 250,
  },
  {
    badgeId: "vineyard_wanderer",
    name: "Vineyard Wanderer",
    icon: "🍷",
    description: "Explored boutique winery valleys and wine tasting retreats",
    category: "Wine & Beverage",
    requiredPoints: 500,
  },
  {
    badgeId: "street_food_pioneer",
    name: "Street Food Pioneer",
    icon: "🌮",
    description: "Unlocked hidden local food spots & neighborhood street stalls",
    category: "Local Exploration",
    requiredPoints: 750,
  },
  {
    badgeId: "private_chef_patron",
    name: "Private Chef Patron",
    icon: "👨‍🍳",
    description: "Indulged in host-prepared traditional homemade dinner experiences",
    category: "Dining Experiences",
    requiredPoints: 1200,
  },
  {
    badgeId: "group_maestro",
    name: "Group Trip Maestro",
    icon: "👥",
    description: "Collaborated on group trips and shared dining expenses with friends",
    category: "Community",
    requiredPoints: 1800,
  },
  {
    badgeId: "michelin_explorer",
    name: "Michelin & Haute Gastronome",
    icon: "🌟",
    description: "Reached top-tier gourmet status with 3,000+ points",
    category: "Elite Status",
    requiredPoints: 3000,
  },
];

const getTierDetails = (points) => {
  if (points >= 3000) {
    return {
      tier: "Platinum Michelin Explorer",
      color: "#9333ea",
      discountPercent: 20,
      nextTier: null,
      pointsToNext: 0,
      progressPercent: 100,
    };
  }
  if (points >= 1500) {
    return {
      tier: "Gold Gastronome",
      color: "#eab308",
      discountPercent: 15,
      nextTier: "Platinum Michelin Explorer",
      pointsToNext: 3000 - points,
      progressPercent: Math.round(((points - 1500) / (3000 - 1500)) * 100),
    };
  }
  if (points >= 500) {
    return {
      tier: "Silver Connoisseur",
      color: "#64748b",
      discountPercent: 10,
      nextTier: "Gold Gastronome",
      pointsToNext: 1500 - points,
      progressPercent: Math.round(((points - 500) / (1500 - 500)) * 100),
    };
  }
  return {
    tier: "Bronze Epicure",
    color: "#b45309",
    discountPercent: 5,
    nextTier: "Silver Connoisseur",
    pointsToNext: 500 - points,
    progressPercent: Math.round((points / 500) * 100),
  };
};

exports.getLoyaltyProfile = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: 0, error: "User not found" });
    }

    const points = user.loyaltyPoints !== undefined ? user.loyaltyPoints : 200;
    const tierInfo = getTierDetails(points);

    // Calculate canClaimDaily
    let canClaimDaily = true;
    let timeUntilNextClaimMs = 0;

    if (user.lastDailyClaim) {
      const msSinceLast = Date.now() - new Date(user.lastDailyClaim).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (msSinceLast < oneDayMs) {
        canClaimDaily = false;
        timeUntilNextClaimMs = oneDayMs - msSinceLast;
      }
    }

    // Determine unlocked badges based on points + explicit user badges
    const userBadgeIds = new Set((user.passportBadges || []).map((b) => b.badgeId));

    const badges = ALL_PASSPORT_BADGES.map((b) => {
      const isUnlocked = userBadgeIds.has(b.badgeId) || points >= b.requiredPoints;
      return {
        ...b,
        isUnlocked,
      };
    });

    res.status(200).json({
      success: 1,
      profile: {
        points,
        tierInfo,
        canClaimDaily,
        timeUntilNextClaimMs,
        badges,
        totalBadgesCount: ALL_PASSPORT_BADGES.length,
        unlockedBadgesCount: badges.filter((b) => b.isUnlocked).length,
      },
    });
  } catch (error) {
    console.error("getLoyaltyProfile error:", error);
    res.status(500).json({ success: 0, error: "Failed to fetch loyalty profile" });
  }
};

exports.claimDailyBonus = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: 0, error: "User not found" });
    }

    if (user.lastDailyClaim) {
      const msSinceLast = Date.now() - new Date(user.lastDailyClaim).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (msSinceLast < oneDayMs) {
        return res.status(400).json({
          success: 0,
          error: "Daily discovery bonus already claimed today. Come back tomorrow!",
        });
      }
    }

    const BONUS_POINTS = 50;
    user.loyaltyPoints = (user.loyaltyPoints || 0) + BONUS_POINTS;
    user.lastDailyClaim = new Date();

    // Auto-unlock first badge if needed
    if (!user.passportBadges) user.passportBadges = [];
    if (!user.passportBadges.some((b) => b.badgeId === "ramen_master")) {
      user.passportBadges.push({
        badgeId: "ramen_master",
        name: "Ramen & Noodle Master",
        icon: "🍜",
        description: "Explored Asian culinary retreats & authentic noodle masterclasses",
        category: "Asian Cuisine",
      });
    }

    await user.save();

    const tierInfo = getTierDetails(user.loyaltyPoints);

    res.status(200).json({
      success: 1,
      message: `🎉 Claimed +${BONUS_POINTS} Gourmet Loyalty Points!`,
      points: user.loyaltyPoints,
      tierInfo,
    });
  } catch (error) {
    console.error("claimDailyBonus error:", error);
    res.status(500).json({ success: 0, error: "Failed to claim bonus" });
  }
};

exports.redeemVoucher = async (req, res) => {
  try {
    const userId = req.user;
    const { voucherType } = req.body; // e.g. "discount_10" (200 pts) | "discount_25" (500 pts)

    const costMap = {
      discount_10: { points: 200, discount: 10, code: `GOURMET10_${Math.random().toString(36).substring(2, 7).toUpperCase()}` },
      discount_25: { points: 500, discount: 25, code: `CHEF25_${Math.random().toString(36).substring(2, 7).toUpperCase()}` },
      discount_50: { points: 1000, discount: 50, code: `VIP50_${Math.random().toString(36).substring(2, 7).toUpperCase()}` },
    };

    const selected = costMap[voucherType] || costMap.discount_10;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: 0, error: "User not found" });
    }

    if ((user.loyaltyPoints || 0) < selected.points) {
      return res.status(400).json({
        success: 0,
        error: `Insufficient points. You need ${selected.points} points for this $${selected.discount} voucher.`,
      });
    }

    user.loyaltyPoints -= selected.points;
    await user.save();

    // Create active system coupon valid for 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newCoupon = new Coupon({
      code: selected.code,
      hostId: "SYSTEM",
      listingId: null, // Valid across all listings and hosts
      discountType: "fixed",
      discountRate: selected.discount,
      maxUsage: 1,
      usageCount: 0,
      expiresAt: expiresAt,
      isActive: true,
    });

    await newCoupon.save();

    // Send real-time notification to user
    const io = req.app.get("io");
    if (io && userId) {
      await sendNotification(io, {
        userId,
        title: "Promo Code Redeemed! 🎁",
        message: `You redeemed ${selected.points} Loyalty Points for voucher code "${selected.code}" ($${selected.discount} OFF)!`,
        type: "reward",
        link: "/users/profile",
      });
    }

    res.status(200).json({
      success: 1,
      message: `🎟️ Voucher Redeemed: $${selected.discount} OFF!`,
      voucherCode: selected.code,
      discountAmount: selected.discount,
      remainingPoints: user.loyaltyPoints,
    });
  } catch (error) {
    console.error("redeemVoucher error:", error);
    res.status(500).json({ success: 0, error: "Failed to redeem voucher" });
  }
};
