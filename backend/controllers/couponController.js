const Coupon = require("../models/coupon.model.js");
const House = require("../models/house.model.js");

// Host creates a new discount code
const createCoupon = async (req, res) => {
  try {
    const hostId = req.userId;
    const {
      code,
      discountType = "percentage",
      discountRate,
      maxUsage = 10,
      expiresAt,
      listingId = null,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Discount code is required" });
    }

    const cleanCode = code.trim().toUpperCase();

    if (!discountRate || Number(discountRate) <= 0) {
      return res.status(400).json({ error: "Valid discount rate is required" });
    }

    if (discountType === "percentage" && Number(discountRate) > 90) {
      return res.status(400).json({ error: "Percentage discount cannot exceed 90%" });
    }

    if (!maxUsage || Number(maxUsage) < 1) {
      return res.status(400).json({ error: "Max usage limit must be at least 1" });
    }

    if (!expiresAt) {
      return res.status(400).json({ error: "Expiration date & time is required" });
    }

    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return res.status(400).json({ error: "Expiration date must be in the future" });
    }

    // Check if an active coupon with the same code already exists for this host
    const existingCoupon = await Coupon.findOne({
      code: cleanCode,
      hostId,
      expiresAt: { $gt: new Date() },
      isActive: true,
    });

    if (existingCoupon) {
      return res.status(400).json({
        error: `Active coupon with code "${cleanCode}" already exists. Please choose a different code or delete the existing one.`,
      });
    }

    // If listingId is provided, verify host owns this listing
    if (listingId) {
      const house = await House.findOne({ _id: listingId, author: hostId });
      if (!house) {
        return res.status(404).json({ error: "Motel listing not found or not owned by you" });
      }
    }

    const newCoupon = new Coupon({
      code: cleanCode,
      hostId,
      listingId: listingId || null,
      discountType,
      discountRate: Number(discountRate),
      maxUsage: Number(maxUsage),
      expiresAt: expiryDate,
      isActive: true,
    });

    await newCoupon.save();

    return res.status(201).json({
      success: true,
      message: `Discount code "${cleanCode}" created successfully!`,
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return res.status(500).json({ error: "Server error creating discount code" });
  }
};

// Host gets all their discount codes
const getHostCoupons = async (req, res) => {
  try {
    const hostId = req.userId;

    // Explicitly delete any expired coupons from DB
    await Coupon.deleteMany({ expiresAt: { $lte: new Date() } });

    const coupons = await Coupon.find({ hostId })
      .populate("listingId", "title photos basePrice")
      .sort({ createdAt: -1 });

    return res.status(200).json(coupons);
  } catch (error) {
    console.error("Error fetching host coupons:", error);
    return res.status(500).json({ error: "Server error fetching discount codes" });
  }
};

// Host removes a discount code
const deleteCoupon = async (req, res) => {
  try {
    const hostId = req.userId;
    const { id } = req.params;

    const deleted = await Coupon.findOneAndDelete({ _id: id, hostId });

    if (!deleted) {
      return res.status(404).json({ error: "Discount code not found or not owned by you" });
    }

    return res.status(200).json({
      success: true,
      message: `Discount code "${deleted.code}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({ error: "Server error deleting discount code" });
  }
};

// Guest/Client validates coupon code at checkout
const validateCoupon = async (req, res) => {
  try {
    const { code, listingId, subtotalUSD = 0 } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    const cleanCode = code.trim().toUpperCase();

    // Clean expired coupons
    await Coupon.deleteMany({ expiresAt: { $lte: new Date() } });

    const coupon = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({
        error: "Invalid or expired discount code",
      });
    }

    if (coupon.usageCount >= coupon.maxUsage) {
      return res.status(400).json({
        error: "This discount code has reached its maximum usage limit",
      });
    }

    // Verify applicability to listing
    if (listingId) {
      const house = await House.findById(listingId);
      if (!house) {
        return res.status(404).json({ error: "Motel listing not found" });
      }

      if (coupon.listingId) {
        if (coupon.listingId.toString() !== listingId.toString()) {
          return res.status(400).json({
            error: "This coupon is only valid for a specific motel property",
          });
        }
      } else {
        // Must belong to the same host
        if (house.author.toString() !== coupon.hostId.toString()) {
          return res.status(400).json({
            error: "This discount code is not applicable to this motel host",
          });
        }
      }
    }

    // Calculate discount amount in USD
    const numSubtotal = Number(subtotalUSD) || 0;
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((numSubtotal * coupon.discountRate) / 100);
    } else {
      discountAmount = Math.min(coupon.discountRate, numSubtotal);
    }

    const newSubtotal = Math.max(0, numSubtotal - discountAmount);

    return res.status(200).json({
      valid: true,
      message: `Discount code applied! You save ${
        coupon.discountType === "percentage"
          ? `${coupon.discountRate}%`
          : `$${coupon.discountRate}`
      }`,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountRate: coupon.discountRate,
        expiresAt: coupon.expiresAt,
        maxUsage: coupon.maxUsage,
        usageCount: coupon.usageCount,
      },
      discountAmount,
      newSubtotal,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return res.status(500).json({ error: "Server error validating discount code" });
  }
};

module.exports = {
  createCoupon,
  getHostCoupons,
  deleteCoupon,
  validateCoupon,
};
