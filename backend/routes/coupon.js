const express = require("express");
const { verifyJwtToken } = require("../middleware/jwt.js");
const {
  createCoupon,
  getHostCoupons,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController.js");

const { standardLimiter } = require("../middleware/rateLimiter.js");

const router = express.Router();

router.use(express.json());
router.use(standardLimiter);

// Public / Guest coupon validation
router.post("/validate", validateCoupon);

// Host coupon management (authenticated)
router.post("/create", verifyJwtToken, createCoupon);
router.get("/my_coupons", verifyJwtToken, getHostCoupons);
router.delete("/:id", verifyJwtToken, deleteCoupon);

module.exports = router;
