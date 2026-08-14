import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import cameraIcon from "../../assets/basicIcon/cameraIcon.png";
import api from "../../backend";
import UserProfilePopup from "../../components/popUp/userProfilePopup/UserProfilePopup.jsx";
import UserAbout from "../../components/userProfile/UserAbout";
import UserProfileOptions from "../../components/userProfile/UserProfileOptions";
import { uploadFiles } from "../../utils/uploadthing";
import { updateUserDetails } from "../../redux/actions/userActions";

const EditProfile = () => {
  const user = useSelector((state) => state.user?.userDetails);
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isImageLoading, setIsImgUploading] = useState(false);
  const [profileImageLink, setProfileImageLink] = useState(null);
  const [image, setImage] = useState(null);

  // Edit Name states
  const [showNameModal, setShowNameModal] = useState(false);
  const [firstName, setFirstName] = useState(user?.name?.firstName || "");
  const [lastName, setLastName] = useState(user?.name?.lastName || "");
  const [isSavingName, setIsSavingName] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setFirstName(user.name.firstName || "");
      setLastName(user.name.lastName !== "guest" ? user.name.lastName : "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function uploadToUploadThing() {
      if (image !== null) {
        if (image.size > 5 * 1024 * 1024) {
          toast.error("Image size can't exceed 5MB");
          setImage(null);
          return;
        }

        try {
          setIsImgUploading(true);
          const res = await uploadFiles("imageUploader", {
            files: [image],
          });
          if (res && res[0]?.url) {
            setProfileImageLink(res[0].url);
          } else {
            toast.error("Upload failed, please try again.");
          }
        } catch (error) {
          console.error(error);
          toast.error(error?.message || "Image upload failed. Try again.");
        } finally {
          setIsImgUploading(false);
          setImage(null);
        }
      }
    }
    uploadToUploadThing();
  }, [image]);

  useEffect(() => {
    async function uploadImg() {
      if (profileImageLink) {
        setIsImgUploading(true);
        try {
          let imageLink = {
            id: user?._id,
            profileImg: profileImageLink,
          };
          const response = await api.post("/auth/uploadimage", imageLink, {
            headers: { "Content-Type": "application/json" },
          });

          if (response.data?.user_details) {
            dispatch(updateUserDetails(response.data.user_details));
          } else if (response.data?.profileImg) {
            dispatch(updateUserDetails({ ...user, profileImg: response.data.profileImg }));
          }
          toast.success("Profile image updated successfully!");
          setProfileImageLink(null);
        } catch (err) {
          console.error(err);
          toast.error("Saving image failed, try again!");
        } finally {
          setIsImgUploading(false);
        }
      }
    }
    uploadImg();
  }, [profileImageLink, user, dispatch]);

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
        dispatch(updateUserDetails(res.data.user_details));
        toast.success("Name updated successfully!");
        setShowNameModal(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div>
      <main className="max-w-[1200px] mx-auto xl:px-10 py-12 flex min-h-[80vh] relative">
        <section
          className={`flex flex-row gap-16 items-start flex-auto${
            isMobile ? " flex-column" : ""
          }`}
          style={
            isMobile && window.innerWidth <= 600
              ? { display: "flex", flexDirection: "column", padding: "30px" }
              : null
          }
        >
          {user?.profileImg ? (
            <div className="relative md:w-[320px]">
              <figure>
                <img
                  src={user?.profileImg}
                  alt="User image"
                  className={`max-w-xs rounded-full border-[1px] object-cover aspect-square ${
                    isMobile ? "mobile-style" : "desktop-style"
                  }`}
                  style={
                    isMobile && window.innerWidth <= 600
                      ? {
                          marginRight: "auto",
                          marginLeft: "auto",
                          display: "block",
                          width: "50%",
                        }
                      : null
                  }
                />
              </figure>
              <div className="flex justify-center items-center relative">
                <label
                  htmlFor="imageUpload"
                  className="absolute flex flex-row gap-2 items-center bg-white dark:bg-[#2a2a2a] shadow-md px-4 py-2 rounded-full -bottom-4 cursor-pointer hover:shadow-lg transition-all"
                >
                  {isImageLoading ? (
                    <PulseLoader
                      color="#ff385c"
                      size={8}
                      speedMultiplier={0.8}
                    />
                  ) : (
                    <>
                      <img
                        src={cameraIcon}
                        alt="Choose photo"
                        className="w-4 h-4 object-contain"
                      />
                      <p className="text-sm font-medium">Add</p>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  className="hidden"
                  onChange={handleImageChange}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 justify-center items-center w-[350px] h-[220px] p-7 sticky top-[128px]">
              <div className="min-w-[214px] min-h-[214px] bg-[#222222] dark:bg-[#333333] rounded-full flex justify-center items-center relative">
                <p className="text-8xl text-white font-semibold mb-2">
                  {user?.name?.firstName?.slice(0, 1) || "U"}
                </p>
                <label
                  htmlFor="imageUpload"
                  className="absolute flex flex-row gap-2 items-center bg-white dark:bg-[#2a2a2a] shadow-md px-4 py-2 rounded-full -bottom-4 cursor-pointer hover:shadow-lg transition-all"
                >
                  {isImageLoading ? (
                    <PulseLoader
                      color="#ff385c"
                      size={8}
                      speedMultiplier={0.8}
                    />
                  ) : (
                    <>
                      <img
                        src={cameraIcon}
                        alt="Choose photo"
                        className="w-4 h-4 object-contain"
                      />
                      <p className="text-sm font-medium">Add</p>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  className="hidden"
                  onChange={handleImageChange}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                />
              </div>
            </div>
          )}
          <section className="xl:min-h-[400px] flex flex-col flex-1 profile__container">
            {/* Legal Name Card with Edit button */}
            <div className="mb-6 p-5 rounded-2xl border border-[#dddddd] dark:border-[#333333] bg-[#fafafa] dark:bg-[#222222] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#222222] dark:text-white">
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

            <UserProfileOptions
              setShowPopup={setShowPopup}
              setSelectedOption={setSelectedOption}
            />
            <UserAbout setShowPopup={setShowPopup} />
          </section>
        </section>
      </main>
      <div className="border-t border-[#dddddd] py-5 bg-[#ffffff] dark:bg-[#1e1e1e] w-full flex flex-row-reverse">
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
