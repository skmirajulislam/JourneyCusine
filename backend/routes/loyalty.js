const express = require("express");
const {
  getLoyaltyProfile,
  claimDailyBonus,
  redeemVoucher,
} = require("../controllers/loyaltyController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");

const router = express.Router();
router.use(express.json());

router.get("/profile", verifyJwtToken, getLoyaltyProfile);
router.post("/claim_daily", verifyJwtToken, claimDailyBonus);
router.post("/redeem", verifyJwtToken, redeemVoucher);

module.exports = router;
