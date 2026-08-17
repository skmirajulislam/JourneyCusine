import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import cameraIcon from "../../assets/basicIcon/cameraIcon.png";
import api from "../../backend";
import UserProfilePopup from "../../components/popUp/userProfilePopup/UserProfilePopup.jsx";
import UserAbout from "../../components/userProfile/UserAbout";
import UserProfileOptions from "../../components/userProfile/UserProfileOptions";
import { uploadToUploadThingDirect } from "../../utils/uploadthing";
import { useAuth } from "../../hooks/useAuth";
import { useCurrency } from "../../context/CurrencyContext";
import { useQueryClient } from "@tanstack/react-query";
import { FiGlobe } from "react-icons/fi";

import DOMPurify from "dompurify";

const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const sanitized = DOMPurify.sanitize(url.trim(), {
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|blob):|data:image\/)/i,
  });
  if (
    sanitized.startsWith("https://") ||
    sanitized.startsWith("http://") ||
    sanitized.startsWith("blob:") ||
    sanitized.startsWith("data:image/")
  ) {
    return sanitized;
  }
  return "";
};

const EditProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuth();
  const { countriesList, supportedCurrencies, setCountry: setGlobalCountry, setCurrency: setGlobalCurrency, currency: currentGlobalCurrency, symbol } = useCurrency();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isImageLoading, setIsImgUploading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  // Edit Name states
  const [showNameModal, setShowNameModal] = useState(false);
  const [firstName, setFirstName] = useState(user?.name?.firstName || "");
  const [lastName, setLastName] = useState(user?.name?.lastName || "");
  const [isSavingName, setIsSavingName] = useState(false);

  // Edit Country & Currency states
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(user?.country || "India");
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "INR");
  const [isSavingCountry, setIsSavingCountry] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setFirstName(user.name.firstName || "");
      setLastName(user.name.lastName !== "guest" ? user.name.lastName : "");
    }
    if (user?.country) {
      setSelectedCountry(user.country);
    }
    if (user?.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image size cannot exceed 8MB");
      return;
    }

    // Immediately display preview in UI for instant responsiveness
    const localPreview = URL.createObjectURL(file);
    setPreviewImg(localPreview);

    try {
      setIsImgUploading(true);

      let uploadedUrl = null;
      try {
        uploadedUrl = await uploadToUploadThingDirect(file);
      } catch (uploadThingErr) {
        console.warn("Direct UploadThing upload notice:", uploadThingErr);
      }

      if (!uploadedUrl) {
        uploadedUrl = await convertFileToBase64(file);
      }

      if (!uploadedUrl) {
        toast.error("Upload failed, please try again.");
        return;
      }

      const response = await api.post(
        "/auth/uploadimage",
        { id: user?._id, profileImg: uploadedUrl },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.user_details) {
        setUser(response.data.user_details);
      } else if (response.data?.profileImg) {
        setUser({ ...user, profileImg: response.data.profileImg });
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Profile image update error:", error);
      toast.error("Failed to update profile image. Try again.");
    } finally {
      setIsImgUploading(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    try {
      setIsSavingName(true);
      const res = await api.post("/auth/updatename", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (res.data?.success === 1) {
        setUser(res.data.user_details);
        toast.success("Legal name updated successfully!");
        setShowNameModal(false);
      } else {
        toast.error(res.data?.error || "Failed to update name");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCountryChange = (countryName) => {
    setSelectedCountry(countryName);
    const matched = supportedCurrencies.find(c => c.country.toLowerCase() === countryName.toLowerCase());
    if (matched) {
      setSelectedCurrency(matched.code);
    }
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    try {
      setIsSavingCountry(true);
      const res = await api.post("/auth/updatecountry", {
        country: selectedCountry,
        currency: selectedCurrency,
      });

      if (res.data?.success === 1) {
        setUser(res.data.user_details);
        setGlobalCountry(selectedCountry);
        setGlobalCurrency(selectedCurrency);
        toast.success(`Country & Currency updated to ${selectedCountry} (${selectedCurrency})!`);
        setShowCountryModal(false);
      } else {
        toast.error(res.data?.error || "Failed to update country and currency");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update country");
    } finally {
      setIsSavingCountry(false);
    }
  };

  const rawAvatarUrl = previewImg || user?.profileImg || "";
  const safeAvatarSrc = DOMPurify.sanitize(sanitizeImageUrl(rawAvatarUrl));

  return (
    <div className="flex flex-col min-h-screen">
      <main className="max-w-[1120px] mx-auto px-6 sm:px-8 xl:px-0 py-8 flex-1">
        <section
          className={`flex ${
            isMobile ? "flex-col" : "flex-row gap-20"
          } items-start justify-between w-full`}
        >
          {/* profile image */}
          {isMobile ? (
            <div className="flex flex-col items-center justify-center w-full mb-8">
              <div className="relative">
                {safeAvatarSrc ? (
                  <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-inner">
                    <img
                      src={safeAvatarSrc}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[150px] h-[150px] bg-[#222222] dark:bg-[#333333] rounded-full flex justify-center items-center">
                    <p className="text-5xl text-white font-semibold">
                      {user?.name?.firstName?.slice(0, 1) || "U"}
                    </p>
                  </div>
                )}
                {isImageLoading ? (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex justify-center items-center">
                    <PulseLoader size={8} color="#ffffff" />
                  </div>
                ) : (
                  <label
                    htmlFor="profileImgInputMobile"
                    className="absolute bottom-1 right-1 p-2.5 rounded-full bg-white dark:bg-[#333333] shadow-md hover:scale-105 transition duration-200 cursor-pointer border border-[#dddddd] dark:border-[#555555]"
                    title="Change profile picture"
                  >
                    <img src={cameraIcon} alt="Camera" className="w-5 h-5" />
                    <input
                      type="file"
                      id="profileImgInputMobile"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#222222] dark:text-white mt-4">
                {user?.name?.firstName} {user?.name?.lastName && user?.name?.lastName !== "guest" ? user?.name?.lastName : ""}
              </h2>
            </div>
          ) : (
            <div className="w-[300px] shrink-0 sticky top-[100px]">
              <div className="flex flex-col gap-4 items-center shadow-lg rounded-3xl p-7 border border-[#dddddd] dark:border-[#333333] bg-white dark:bg-[#1e1e1e]">
                <div className="relative">
                  {safeAvatarSrc ? (
                    <div className="w-[180px] h-[180px] rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-inner">
                      <img
                        src={safeAvatarSrc}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-[180px] h-[180px] bg-[#222222] dark:bg-[#333333] rounded-full flex justify-center items-center">
                      <p className="text-7xl text-white font-semibold">
                        {user?.name?.firstName?.slice(0, 1) || "U"}
                      </p>
                    </div>
                  )}
                  {isImageLoading ? (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex justify-center items-center">
                      <PulseLoader size={8} color="#ffffff" />
                    </div>
                  ) : (
                    <label
                      htmlFor="profileImgInputDesktop"
                      className="absolute bottom-1 right-1 p-2.5 rounded-full bg-white dark:bg-[#333333] shadow-md hover:scale-105 transition duration-200 cursor-pointer border border-[#dddddd] dark:border-[#555555]"
                      title="Change profile picture"
                    >
                      <img src={cameraIcon} alt="Camera" className="w-5 h-5" />
                      <input
                        type="file"
                        id="profileImgInputDesktop"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#222222] dark:text-white text-center">
                  {user?.name?.firstName} {user?.name?.lastName && user?.name?.lastName !== "guest" ? user?.name?.lastName : ""}
                </h3>
              </div>
            </div>
          )}

          <section className="xl:min-h-[400px] flex flex-col flex-1 profile__container">
            {/* Legal Name Card */}
            <div className="mb-4 p-5 rounded-2xl border border-[#dddddd] dark:border-[#333333] bg-[#fafafa] dark:bg-[#222222] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#222222] dark:text-white">
                  {user?.name?.firstName} {user?.name?.lastName && user?.name?.lastName !== "guest" ? user?.name?.lastName : ""}
                </h2>
                <p className="text-xs text-[#717171] dark:text-[#a0a0a0] mt-0.5">
                  Account full name
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNameModal(true)}
                className="px-4 py-2 rounded-xl border border-[#222222] dark:border-[#555555] hover:bg-white dark:hover:bg-[#2a2a2a] text-xs font-semibold text-[#222222] dark:text-white transition-colors cursor-pointer shadow-xs"
              >
                Edit Name
              </button>
            </div>

            {/* Country & Currency Card */}
            <div className="mb-6 p-5 rounded-2xl border border-[#dddddd] dark:border-[#333333] bg-[#fafafa] dark:bg-[#222222] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FiGlobe className="text-[#ff385c]" size={16} />
                  <h3 className="text-sm font-bold text-[#222222] dark:text-white">
                    {user?.country || "India"} • {user?.currency || currentGlobalCurrency} ({symbol})
                  </h3>
                </div>
                <p className="text-xs text-[#717171] dark:text-[#a0a0a0]">
                  Prices and Razorpay checkouts are automatically calculated in your local currency.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCountryModal(true)}
                className="px-4 py-2 rounded-xl border border-[#222222] dark:border-[#555555] hover:bg-white dark:hover:bg-[#2a2a2a] text-xs font-semibold text-[#222222] dark:text-white transition-colors cursor-pointer shadow-xs"
              >
                Change Country & Currency
              </button>
            </div>

            <UserProfileOptions
              setShowPopup={setShowPopup}
              setSelectedOption={setSelectedOption}
            />
            <UserAbout setShowPopup={setShowPopup} />
          </section>
        </section>
      </main>

      <div className="border-t border-[#dddddd] dark:border-neutral-800 py-5 bg-[#ffffff] dark:bg-[#1e1e1e] w-full flex flex-row-reverse">
        <Link
          to={`/users/show/${user?._id}`}
          className="px-7 py-3 bg-[#282828] hover:bg-[#000000] text-white rounded-lg mx-6 font-medium transition-colors"
        >
          Done
        </Link>
      </div>

      {/* Edit Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-1">
              Edit Legal Name
            </h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-4">
              Update the name shown on your profile and reservations.
            </p>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="First name"
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  {isSavingName ? "Saving..." : "Save Name"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Country & Currency Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-1 flex items-center gap-2">
              <FiGlobe className="text-[#ff385c]" />
              Country & Currency Settings
            </h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-4">
              Select your country. Razorpay will automatically process orders in your national currency.
            </p>

            <form onSubmit={handleSaveCountry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                >
                  {countriesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Preferred Currency (Processed by Razorpay)
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                >
                  {supportedCurrencies.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.code} - {cur.name} ({cur.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCountryModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCountry}
                  className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  {isSavingCountry ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPopup && (
        <UserProfilePopup
          showPopup={showPopup}
          setShowPopup={setShowPopup}
          popupData={selectedOption}
        />
      )}
    </div>
  );
};

export default EditProfile;
