/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../backend";
import {
  AiFillStar,
  AiOutlineStar,
  AiFillHeart,
  AiOutlineHeart,
} from "react-icons/ai";
import {
  FiAlertTriangle,
  FiTrash2,
  FiEdit2,
  FiSend,
  FiMessageSquare,
  FiShield,
  FiInfo,
  FiCheck,
} from "react-icons/fi";
import AuthenticationPopUp from "../popUp/authentication/AuthenticationPopUp";

const PropertyReviews = ({ listingId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviewsData = {}, isLoading, refetch: fetchReviews } = useQuery({
    queryKey: ["listingReviews", listingId],
    queryFn: async () => {
      if (!listingId) return { reviews: [], totalReviews: 0, avgRating: 0 };
      try {
        const res = await api.get(`/reviews/listing/${listingId}`);
        return res.data?.success ? res.data : { reviews: [], totalReviews: 0, avgRating: 0 };
      } catch (error) {
        console.error("Error fetching reviews:", error);
        return { reviews: [], totalReviews: 0, avgRating: 0 };
      }
    },
    enabled: Boolean(listingId),
    staleTime: 3 * 60 * 1000,
  });

  const reviews = reviewsData.reviews || [];
  const totalReviews = reviewsData.totalReviews || 0;
  const avgRating = reviewsData.avgRating || 0;

  // Form state for new review
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // AI Moderation Warning Modal
  const [aiWarning, setAiWarning] = useState(null);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter your review comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post("/reviews/add", {
        listingId,
        rating,
        comment: comment.trim(),
      });

      if (res.data?.success) {
        setComment("");
        setRating(5);
        fetchReviews();

        if (res.data?.warning) {
          setAiWarning(res.data.warning);
        } else {
          toast.success("Review submitted successfully!");
        }
      }
    } catch (error) {
      console.error("Error posting review:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit review.";

      if (error.response?.data?.isSuspended) {
        setAiWarning({
          isSuspended: true,
          message: errMsg,
          warningCount: 5,
        });
      } else {
        toast.error(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (rev) => {
    setEditingReviewId(rev._id);
    setEditRating(rev.rating || 5);
    setEditComment(rev.comment || rev.cleanComment || "");
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReviewId) return;

    if (!editComment.trim()) {
      toast.error("Review comment cannot be empty.");
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const res = await api.put(`/reviews/edit/${editingReviewId}`, {
        rating: editRating,
        comment: editComment.trim(),
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Review updated successfully!");
        setEditingReviewId(null);
        fetchReviews();

        if (res.data?.warning) {
          setAiWarning(res.data.warning);
        }
      }
    } catch (error) {
      console.error("Error updating review:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update review.";
      toast.error(errMsg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleToggleLike = async (reviewId) => {
    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    try {
      const res = await api.post(`/reviews/like/${reviewId}`);
      if (res.data?.success) {
        queryClient.setQueryData(["listingReviews", listingId], (old) => {
          if (!old || !Array.isArray(old.reviews)) return old;
          const userStr = String(user._id);
          const updatedReviews = old.reviews.map((r) => {
            if (r._id === reviewId) {
              const newLikes = res.data.liked
                ? [...(r.likes || []), userStr]
                : (r.likes || []).filter((id) => String(id) !== userStr);
              return {
                ...r,
                likes: newLikes,
                likesCount: res.data.likesCount,
              };
            }
            return r;
          });
          return { ...old, reviews: updatedReviews };
        });
      }
    } catch (error) {
      console.error("Error liking review:", error);
      toast.error("Failed to like review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data?.success) {
        toast.success("Review deleted.");
        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review.");
    }
  };

  // Rating breakdown stats
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    return counts;
  }, [reviews]);

  return (
    <section className="mt-12 pt-10 border-t border-[#e5e7eb] dark:border-[#2f2f2f] w-full">
      {/* Header & Overall Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#222222] dark:text-white flex items-center gap-2.5">
            <FiMessageSquare className="text-[#ff385c]" size={24} />
            Guest Reviews & Feedback
          </h2>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-[#717171] dark:text-[#a0a0a0]">
            <span className="flex items-center gap-1 font-bold text-gray-900 dark:text-white text-base">
              <AiFillStar className="text-amber-500" size={18} />
              {avgRating > 0 ? avgRating : "New"}
            </span>
            <span>•</span>
            <span className="font-medium">
              {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
            </span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        {totalReviews > 0 && (
          <div className="flex flex-col gap-1 w-full sm:w-64">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-gray-500 dark:text-gray-400 font-medium">
                    {stars}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-[11px] text-gray-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2f2f2f] rounded-3xl p-6 sm:p-7 shadow-xs mb-10">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
          Leave a Review
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Honest feedback (positive or negative) is encouraged! Inappropriate or abusive profanity will be automatically blurred by AI moderation.
        </p>

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Star Rating Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Your Rating:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                >
                  {(hoverRating || rating) >= star ? (
                    <AiFillStar className="text-amber-400" />
                  ) : (
                    <AiOutlineStar className="text-gray-300 dark:text-gray-600" />
                  )}
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {rating} / 5 Stars
            </span>
          </div>

          {/* Comment input textarea */}
          <div className="relative">
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your honest review (cleanliness, comfort, service, location)..."
              maxLength={1000}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-[#383838] bg-neutral-50 dark:bg-[#222222] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#ff385c]/40 transition"
            />
            <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1 px-1">
              <span className="flex items-center gap-1">
                <FiShield size={12} className="text-emerald-500" />
                Protected by Gemini AI Content Moderation
              </span>
              <span>{comment.length} / 1000 characters</span>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#e00b41] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Scanning & Posting...</span>
                </>
              ) : (
                <>
                  <FiSend size={13} />
                  <span>Post Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 px-6 text-center max-w-sm mx-auto bg-neutral-50 dark:bg-[#1f1f1f] rounded-3xl border border-gray-100 dark:border-[#2a2a2a]">
            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-[#2c2c2c] text-gray-400 flex items-center justify-center mx-auto mb-3">
              <FiMessageSquare size={20} />
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              No reviews yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Be the first to share your thoughts on this motel property!
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isMyReview = user?._id && String(user._id) === String(rev.userId);
            const userLiked = user?._id && rev.likes?.some((id) => String(id) === String(user._id));
            const isEditingThis = editingReviewId === rev._id;

            const reviewDate = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            return (
              <div
                key={rev._id}
                className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-3xl p-5 sm:p-6 shadow-xs transition hover:shadow-sm"
              >
                {/* Author Info & Rating */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ff385c]/10 text-[#ff385c] font-bold flex items-center justify-center text-sm uppercase shrink-0 overflow-hidden">
                      {rev.userAvatar ? (
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        rev.userName?.charAt(0) || "U"
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{rev.userName}</span>
                        {isMyReview && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                            You
                          </span>
                        )}
                        {rev.isEdited && (
                          <span className="text-[10px] text-gray-400 font-normal italic">
                            (Edited)
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {reviewDate}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars and Author Action Controls (Only visible to review author) */}
                  <div className="flex items-center gap-2">
                    {!isEditingThis && (
                      <div className="flex items-center gap-0.5 text-amber-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <AiFillStar
                            key={i}
                            className={
                              i < rev.rating
                                ? "text-amber-400"
                                : "text-gray-200 dark:text-gray-700"
                            }
                            size={14}
                          />
                        ))}
                      </div>
                    )}

                    {isMyReview && !isEditingThis && (
                      <div className="flex items-center gap-1 ml-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(rev)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                          title="Edit your review"
                        >
                          <FiEdit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                          title="Delete your review"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Editing Form if currently in edit mode */}
                {isEditingThis ? (
                  <form onSubmit={handleSaveEdit} className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Edit Rating:
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            onMouseEnter={() => setEditHoverRating(star)}
                            onMouseLeave={() => setEditHoverRating(0)}
                            className="p-1 text-lg cursor-pointer"
                          >
                            {(editHoverRating || editRating) >= star ? (
                              <AiFillStar className="text-amber-400" />
                            ) : (
                              <AiOutlineStar className="text-gray-300 dark:text-gray-600" />
                            )}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">
                        {editRating} / 5 Stars
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="Update your review..."
                      maxLength={1000}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 dark:border-[#383838] bg-neutral-50 dark:bg-[#222222] text-gray-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#ff385c]/40 transition"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSubmittingEdit}
                        className="px-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingEdit || !editComment.trim()}
                        className="px-4 py-1.5 rounded-xl bg-[#ff385c] hover:bg-[#e00b41] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isSubmittingEdit ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck size={13} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Red Mark / Red Dot Flag if AI Detected Offensive Language */}
                    {rev.hasOffensiveContent && (
                      <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block -ml-4.5" />
                        <span>
                          Moderated by AI: Inappropriate language was detected and automatically blurred.
                        </span>
                      </div>
                    )}

                    {/* Comment Text */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {rev.cleanComment || rev.comment}
                    </p>

                    {/* Like Button & Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-[#252525] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(rev._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
                          userLiked
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold"
                            : "bg-neutral-50 dark:bg-[#222222] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {userLiked ? (
                          <AiFillHeart size={16} className="text-rose-500" />
                        ) : (
                          <AiOutlineHeart size={16} />
                        )}
                        <span>
                          {rev.likesCount || 0} {rev.likesCount === 1 ? "Like" : "Likes"}
                        </span>
                      </button>

                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <FiShield size={11} className="text-emerald-500" />
                        Verified Guest Review
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* AI Moderation Warning Modal */}
      {aiWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#383838] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <FiAlertTriangle size={28} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {aiWarning.isSuspended
                  ? "⛔ Account Suspended"
                  : `⚠️ Community Rule Warning (${aiWarning.warningCount || 1}/5)`}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {aiWarning.message}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-gray-100 dark:border-[#333333] text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <FiInfo size={13} className="text-[#ff385c]" />
                Community Guidelines:
              </p>
              <p>• Negative ratings & constructive complaints are 100% permitted.</p>
              <p>• Vulgar profanity, hate speech, and harassment are strictly prohibited.</p>
              <p>• 5 violations will lead to a 2-week temporary suspension.</p>
            </div>

            <button
              type="button"
              onClick={() => setAiWarning(null)}
              className="w-full py-3 rounded-xl bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* Auth Popup */}
      {showAuthPopup && (
        <AuthenticationPopUp
          popup={showAuthPopup}
          setPopup={setShowAuthPopup}
        />
      )}
    </section>
  );
};

export default PropertyReviews;
