const mongoose = require("mongoose");
const Review = require("../models/review.model.js");
const House = require("../models/house.model.js");
const User = require("../models/user.model.js");

// Multi-lingual profanity and offensive word patterns (English, Hindi, Bengali, etc.)
const PROFANITY_PATTERNS = [
  /\b(fuck|fucking|fucker|fck|motherfucker|bitch|bastard|asshole|cunt|dick|pussy|whore|slut|nigger|nigga|faggot|retard)\b/gi,
  /\b(chutiya|bhenchod|madarchod|gaand|bhosdike|harami|kameena|saala|suar|randi|lauda|loda|gandu|choot)\b/gi,
  /\b(bokachoda|khankirpola|magirpola|bal)\b/gi,
  /\b(kill you|die you|murder you|rape|terrorist|bombing|suicide|shoot you|attack you|slit your throat)\b/gi,
];

/**
 * Local regex censor helper
 */
function localCensor(text) {
  let censored = text;
  const detectedWords = [];

  PROFANITY_PATTERNS.forEach((pattern) => {
    censored = censored.replace(pattern, (matched) => {
      detectedWords.push(matched);
      if (matched.length <= 2) return "*".repeat(matched.length);
      return matched[0] + "*".repeat(matched.length - 2) + matched[matched.length - 1];
    });
  });

  return {
    isOffensive: detectedWords.length > 0,
    offensiveWords: [...new Set(detectedWords)],
    cleanComment: censored,
  };
}

/**
 * AI-powered Review Content Moderation using Gemini API
 */
async function moderateReviewWithAI(text) {
  const localResult = localCensor(text);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return localResult;
  }

  const models = [
    process.env.GEMINI_MODERATION_MODEL || "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  const prompt = `You are a content moderation AI for a hospitality review platform.
Task: Analyze the user's review comment.
CRITICAL DISTINCTION:
- Negative feedback/criticism (e.g. "The room was dirty", "AC was broken", "Bad service", "Host was unhelpful", "Worst experience") is 100% PERMITTED and NOT offensive.
- Prohibited offensive content includes: Profanity, vulgar slurs, sexual abuse, hate speech, threats of violence, extreme harassment.

Comment text: "${text}"

Respond ONLY with a valid raw JSON object:
{
  "isOffensive": true or false,
  "offensiveWords": ["list", "of", "exact", "abusive", "words"],
  "cleanComment": "The comment text with ONLY the offensive words replaced with asterisks (e.g. f***), preserving all other negative feedback intact",
  "reason": "Short explanation"
}`;

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          try {
            const parsed = JSON.parse(rawContent.trim());
            return {
              isOffensive: Boolean(parsed.isOffensive || localResult.isOffensive),
              offensiveWords: [
                ...new Set([
                  ...(parsed.offensiveWords || []),
                  ...localResult.offensiveWords,
                ]),
              ],
              cleanComment: parsed.cleanComment || localResult.cleanComment,
              reason: parsed.reason || "",
            };
          } catch {
            // JSON parse fallback
          }
        }
      }
    } catch (err) {
      console.warn(`Gemini review moderation model ${model} error:`, err.message);
    }
  }

  return localResult;
}

/**
 * Add a new review for a property
 */
const addReview = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { listingId, rating = 5, comment } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: "Listing ID is required." });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Review comment cannot be empty." });
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));

    // 1. Check if user is suspended
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isSuspended && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      const unlockDate = new Date(user.suspendedUntil).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return res.status(403).json({
        message: `Your account is temporarily suspended until ${unlockDate} due to repeated community rule violations.`,
        isSuspended: true,
        suspendedUntil: user.suspendedUntil,
      });
    }

    // 2. Perform AI & Regex Content Moderation
    const moderation = await moderateReviewWithAI(comment.trim());

    let warningInfo = null;

    if (moderation.isOffensive) {
      user.offensiveWarnings = (user.offensiveWarnings || 0) + 1;

      if (user.offensiveWarnings >= 5) {
        user.isSuspended = true;
        user.suspendedUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2-week suspension
        await user.save();

        warningInfo = {
          warningCount: user.offensiveWarnings,
          isSuspended: true,
          suspendedUntil: user.suspendedUntil,
          message: `Warning 5/5: Inappropriate language detected. Your account has been suspended for 2 weeks.`,
        };
      } else {
        await user.save();
        warningInfo = {
          warningCount: user.offensiveWarnings,
          isSuspended: false,
          message: `Warning ${user.offensiveWarnings}/5: Inappropriate language was detected and automatically blurred. 5 warnings will result in a 2-week account suspension.`,
        };
      }
    }

    const userName = `${user.name?.firstName || "Guest"} ${user.name?.lastName || ""}`.trim();
    const userAvatar = user.profileImg || "";

    // 3. Save Review Document
    const newReview = new Review({
      listingId: String(listingId),
      userId: String(userId),
      userName,
      userAvatar,
      rating: numRating,
      comment: comment.trim(),
      cleanComment: moderation.cleanComment,
      hasOffensiveContent: moderation.isOffensive,
      offensiveWords: moderation.offensiveWords,
      isFlagged: moderation.isOffensive,
      moderationReason: moderation.reason || "",
      likes: [],
      likesCount: 0,
    });

    const savedReview = await newReview.save();

    // 4. Recalculate average rating for the house
    try {
      const allReviews = await Review.find({ listingId: String(listingId) });
      if (allReviews.length > 0) {
        const avg = (
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        ).toFixed(1);
        const houseObjId = new mongoose.Types.ObjectId(String(listingId));
        await House.findByIdAndUpdate(houseObjId, { ratings: Number(avg) });
      }
    } catch (err) {
      console.error("Error updating house rating:", err);
    }

    return res.status(201).json({
      success: true,
      message: moderation.isOffensive
        ? "Review posted with community moderation applied."
        : "Review submitted successfully!",
      review: savedReview,
      warning: warningInfo,
    });
  } catch (error) {
    console.error("addReview error:", error);
    return res.status(500).json({ error: error.message || "Failed to post review." });
  }
};

/**
 * Get all reviews for a listing
 */
const getListingReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!listingId) {
      return res.status(400).json({ message: "Listing ID is required." });
    }

    const reviews = await Review.find({ listingId: String(listingId) })
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    return res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      avgRating: Number(avgRating),
    });
  } catch (error) {
    console.error("getListingReviews error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle like on a review
 */
const toggleLikeReview = async (req, res) => {
  try {
    const userId = req.user;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const userStr = String(userId);
    const existingIndex = review.likes.findIndex((id) => String(id) === userStr);

    let liked = false;
    if (existingIndex > -1) {
      review.likes.splice(existingIndex, 1);
      liked = false;
    } else {
      review.likes.push(userStr);
      liked = true;
    }

    review.likesCount = review.likes.length;
    await review.save();

    return res.status(200).json({
      success: true,
      liked,
      likesCount: review.likesCount,
    });
  } catch (error) {
    console.error("toggleLikeReview error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete own review
 */
const deleteReview = async (req, res) => {
  try {
    const userId = req.user;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (String(review.userId) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized to delete this review." });
    }

    const listingId = review.listingId;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate average rating
    try {
      const allReviews = await Review.find({ listingId: String(listingId) });
      const avg =
        allReviews.length > 0
          ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
          : null;
      await House.findByIdAndUpdate(listingId, { ratings: avg });
    } catch {
      // ignore
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Edit own review
 */
const editReview = async (req, res) => {
  try {
    const userId = req.user;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Strict Security Check: Only the original author can edit
    if (String(review.userId) !== String(userId)) {
      return res.status(403).json({
        message: "Unauthorized: You can only edit your own review.",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Review comment cannot be empty." });
    }

    // Check user suspension status
    const user = await User.findById(userId);
    if (user && user.isSuspended && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      return res.status(403).json({
        message: "Your account is temporarily suspended due to community guidelines violations.",
        isSuspended: true,
      });
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || review.rating || 5));
    const newComment = comment.trim();
    const oldComment = (review.comment || "").trim();
    const isTextChanged = newComment !== oldComment;

    let warningInfo = null;

    if (isTextChanged) {
      // ONLY invoke Gemini AI moderation if text was actually changed
      const moderation = await moderateReviewWithAI(newComment);

      if (moderation.isOffensive && user) {
        user.offensiveWarnings = (user.offensiveWarnings || 0) + 1;
        if (user.offensiveWarnings >= 5) {
          user.isSuspended = true;
          user.suspendedUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          await user.save();
          warningInfo = {
            warningCount: user.offensiveWarnings,
            isSuspended: true,
            suspendedUntil: user.suspendedUntil,
            message: `Warning 5/5: Inappropriate language detected. Your account has been suspended for 2 weeks.`,
          };
        } else {
          await user.save();
          warningInfo = {
            warningCount: user.offensiveWarnings,
            isSuspended: false,
            message: `Warning ${user.offensiveWarnings}/5: Inappropriate language was detected and blurred. 5 warnings lead to a 2-week account suspension.`,
          };
        }
      }

      review.comment = newComment;
      review.cleanComment = moderation.cleanComment;
      review.hasOffensiveContent = moderation.isOffensive;
      review.offensiveWords = moderation.offensiveWords;
      review.isFlagged = moderation.isOffensive;
      review.moderationReason = moderation.reason || "";
    }

    review.rating = numRating;
    review.isEdited = true;

    const updatedReview = await review.save();

    // Recalculate average rating for the motel
    try {
      const allReviews = await Review.find({ listingId: String(review.listingId) });
      if (allReviews.length > 0) {
        const avg = (
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        ).toFixed(1);
        await House.findByIdAndUpdate(review.listingId, { ratings: Number(avg) });
      }
    } catch (err) {
      console.error("Error updating house rating:", err);
    }

    return res.status(200).json({
      success: true,
      message: moderation.isOffensive
        ? "Review updated with community moderation applied."
        : "Review updated successfully!",
      review: updatedReview,
      warning: warningInfo,
    });
  } catch (error) {
    console.error("editReview error:", error);
    return res.status(500).json({ error: error.message || "Failed to update review." });
  }
};

module.exports = {
  addReview,
  getListingReviews,
  toggleLikeReview,
  deleteReview,
  editReview,
};
