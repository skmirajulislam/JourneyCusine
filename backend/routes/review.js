const express = require("express");
const {
  addReview,
  getListingReviews,
  toggleLikeReview,
  deleteReview,
  editReview,
} = require("../controllers/reviewController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");

const router = express.Router();

router.use(express.json());

// Public: Get all reviews for a motel listing
router.get("/listing/:listingId", getListingReviews);

// Protected: Post a new review (with AI content moderation)
router.post("/add", verifyJwtToken, addReview);

// Protected: Edit own review (with AI content moderation)
router.put("/edit/:reviewId", verifyJwtToken, editReview);

// Protected: Like / unlike a review
router.post("/like/:reviewId", verifyJwtToken, toggleLikeReview);

// Protected: Delete own review
router.delete("/:reviewId", verifyJwtToken, deleteReview);

module.exports = router;
