import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { LiaPhotoVideoSolid } from "react-icons/lia";
import {
  FiAlertTriangle,
  FiShield,
  FiX,
  FiTrash2,
  FiCheckCircle,
  FiAlertOctagon,
} from "react-icons/fi";
import { PropagateLoader } from "react-spinners";
import { useListingFlow } from "../../context/ListingFlowContext";
import { uploadFiles } from "../../utils/uploadthing";
import api from "../../backend";

const PhotosCard = () => {
  const { newHouse, currentListingHouse, setNewHouse } = useListingFlow();

  const initialPhotos =
    newHouse?.photos || currentListingHouse?.photos || [];

  const [images, setImages] = useState(
    Array.isArray(initialPhotos) ? initialPhotos : []
  );
  const [isImgUploading, setIsImgUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [violationModal, setViolationModal] = useState(null);

  // Sync images with ListingFlow context whenever images array changes
  useEffect(() => {
    setNewHouse((prev) => ({
      ...prev,
      photos: images,
    }));
  }, [images, setNewHouse]);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    // Reset file input so user can re-select if desired
    event.target.value = "";

    if (!file) return;

    if (images.length >= 5) {
      toast.error("Maximum 5 images allowed per stay.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size cannot exceed 5MB.");
      return;
    }

    try {
      setIsImgUploading(true);
      setUploadStatusMsg("Scanning image with Gemini AI Safety Auditor...");

      // 1. Convert to base64
      const base64Data = await convertFileToBase64(file);

      // 2. AI Image Safety Moderation via Gemini
      const moderationRes = await api.post("/ai/moderate_image", {
        imageBase64: base64Data,
        mimeType: file.type || "image/jpeg",
      });

      if (moderationRes.data?.isViolating) {
        setIsImgUploading(false);
        setUploadStatusMsg("");

        // Show safety violation popup modal
        setViolationModal({
          category: moderationRes.data.category,
          categoryLabel:
            moderationRes.data.categoryLabel || "Prohibited Content",
          reason:
            moderationRes.data.reason ||
            "Adult, violent, racist, or harm-related imagery detected.",
          warningCount: moderationRes.data.warningCount || 1,
          warningsRemaining: moderationRes.data.warningsRemaining ?? 4,
          isTerminated: moderationRes.data.isTerminated || false,
        });

        toast.error(
          `Image rejected: ${moderationRes.data.categoryLabel || "Safety Policy Violation"}`,
          { duration: 5000, id: "image-violation-toast" }
        );
        return;
      }

      // 3. Image passed AI check -> Upload to storage
      setUploadStatusMsg("Image verified safe! Uploading to server...");
      const res = await uploadFiles("imageUploader", {
        files: [file],
      });

      const imgUrl =
        res?.[0]?.ufsUrl ||
        res?.[0]?.url ||
        (res?.[0]?.key ? `https://utfs.io/f/${res[0].key}` : null);

      if (imgUrl) {
        setImages((prev) => [...prev, imgUrl]);
        toast.success("Image passed AI inspection and uploaded!");
      } else {
        toast.error("Upload failed, please try again.");
      }
    } catch (error) {
      console.error("Image upload/moderation error:", error);
      if (error.response?.data?.isTerminated) {
        setViolationModal({
          categoryLabel: "Permanent Account Blockage",
          reason:
            error.response.data.error ||
            "Your account has been terminated due to repeated community safety violations.",
          warningCount: 5,
          warningsRemaining: 0,
          isTerminated: true,
        });
      } else {
        toast.error(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Error processing image safety check."
        );
      }
    } finally {
      setIsImgUploading(false);
      setUploadStatusMsg("");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTerminatedLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Upload area */}
      <label
        htmlFor="houseImage"
        className={`relative py-14 px-6 bg-white dark:bg-[#1e1e1e] border-2 border-dashed ${
          isImgUploading
            ? "border-[#ff385c] bg-rose-50/20 dark:bg-rose-950/10"
            : "border-[#b0b0b0] dark:border-[#444444] hover:border-black dark:hover:border-white"
        } rounded-3xl flex flex-col justify-center items-center min-h-[300px] cursor-pointer transition-all duration-200 shadow-xs group`}
      >
        {isImgUploading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-[#ff385c] flex items-center justify-center animate-pulse">
              <FiShield size={28} />
            </div>
            <PropagateLoader loading color="#ff385c" size={10} />
            <div className="mt-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {uploadStatusMsg}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Checking for adult, sexual, racist, violent, or harm-related content
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <LiaPhotoVideoSolid size={36} />
            </div>

            <div>
              <h6 className="text-xl text-gray-900 dark:text-white font-semibold">
                Upload your motel photos
              </h6>
              <p className="text-sm text-[#717171] dark:text-neutral-400 mt-1">
                {images.length > 0
                  ? `${images.length} of 5 photos uploaded`
                  : "Upload at least 1 photo to proceed (max 5 photos)"}
              </p>
              <span className="inline-block mt-3 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold shadow-xs">
                Browse from device
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-2">
              <FiShield className="text-emerald-500" size={13} />
              <span>Protected by Gemini AI Image Safety & Moderation</span>
            </div>
          </div>
        )}

        <input
          type="file"
          name="photos"
          className="hidden"
          onChange={handleImageSelect}
          id="houseImage"
          disabled={isImgUploading}
          accept="image/jpeg,image/png,image/webp,image/jpg"
        />
      </label>

      {/* Uploaded photos gallery */}
      {images.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FiCheckCircle className="text-emerald-500" size={16} />
            Uploaded & Verified Photos ({images.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((photoUrl, i) => (
              <div
                key={i}
                className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm aspect-4/3 bg-neutral-100 dark:bg-neutral-900"
              >
                <img
                  src={photoUrl}
                  alt={`Stay photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/70 hover:bg-rose-600 text-white shadow-md transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <FiTrash2 size={13} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] font-semibold text-white">
                    Cover Photo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Violation Warning Modal Popup */}
      {violationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1c1c1c] border border-rose-200 dark:border-rose-900/60 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0">
                <FiAlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {violationModal.isTerminated
                    ? "Account Terminated & Blacklisted"
                    : "Prohibited Content Detected"}
                </h3>
                <span className="text-xs text-rose-500 font-semibold">
                  {violationModal.categoryLabel}
                </span>
              </div>
              {!violationModal.isTerminated && (
                <button
                  type="button"
                  onClick={() => setViolationModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 leading-relaxed">
                <p className="font-semibold mb-1">AI Safety Analysis Finding:</p>
                <p>{violationModal.reason}</p>
              </div>

              {/* Warning Strike Progress */}
              {!violationModal.isTerminated ? (
                <div className="space-y-2 p-3 rounded-xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200 dark:border-neutral-800">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <span>Community Rule Strike:</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      Strike {violationModal.warningCount} of 5
                    </span>
                  </div>

                  {/* Strike progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        violationModal.warningCount >= 4
                          ? "bg-rose-600"
                          : violationModal.warningCount >= 2
                          ? "bg-amber-500"
                          : "bg-amber-400"
                      }`}
                      style={{
                        width: `${(violationModal.warningCount / 5) * 100}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {violationModal.warningsRemaining > 0 ? (
                      <>
                        You have{" "}
                        <strong>{violationModal.warningsRemaining} warning(s)</strong>{" "}
                        remaining. Reaching 5 strikes will permanently delete your
                        account and blacklist your email address.
                      </>
                    ) : (
                      <strong className="text-rose-600">
                        This is your final warning strike!
                      </strong>
                    )}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-900 text-red-900 dark:text-red-200">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <FiAlertOctagon size={16} /> 5 Violations Reached
                  </p>
                  <p>
                    Due to repeated uploads of adult, violent, racist, or harm-related
                    content, your account has been permanently removed from our
                    database and your email address has been blacklisted.
                  </p>
                </div>
              )}

              {/* Policy description */}
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Journey Cuisine enforces strict zero-tolerance policies against
                sexually explicit material, racism, hate imagery, core violence,
                and murder/harm in accommodation listings.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-end">
              {violationModal.isTerminated ? (
                <button
                  type="button"
                  onClick={handleTerminatedLogout}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                  Acknowledge & Exit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViolationModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                  I Understand
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosCard;
