const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    cleanComment: {
      type: String,
      required: true,
      trim: true,
    },
    hasOffensiveContent: {
      type: Boolean,
      default: false,
    },
    offensiveWords: {
      type: [String],
      default: [],
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    moderationReason: {
      type: String,
      default: "",
    },
    likes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
