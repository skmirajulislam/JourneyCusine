// import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import cameraIcon from "../../assets/basicIcon/cameraIcon.png";
import api from "../../backend";
// import UserProfilePopup from "../../components/popUp/userProfilePopup/userProfilePopup";
import UserProfilePopup from "../../components/popUp/userProfilePopup/UserProfilePopup.jsx";
import UserAbout from "../../components/userProfile/UserAbout";
import UserProfileOptions from "../../components/userProfile/UserProfileOptions";

const EditProfile = () => {
  const user = useSelector((state) => state.user.userDetails);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isImageLoading, setIsImgUploading] = useState(false);
  const [profileImageLink, setProfileImageLink] = useState(null);
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    console.log(e.target.files[0]);
  };

  const [hasReloaded, setHasReloaded] = useState(true);
  useEffect(() => {
    const hasReloadedFromStorage = localStorage.getItem('hasReloaded');
    if (hasReloaded && hasReloadedFromStorage == 'true') {
      // Reload the page only once
      window.location.reload();
      setHasReloaded(false);
      localStorage.setItem('hasReloaded', 'false');
    }
  }, [hasReloaded]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    // Initial check
    handleResize();

    // Event listener for resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* The `useEffect` hook in the provided code is responsible for uploading an image file to the
Cloudinary service when the `image` state variable changes. */
  useEffect(() => {
    if (image !== null && image?.size / 500000 < 5) {
      const imageFormData = new FormData();
      imageFormData.append("file", image);
      imageFormData.append("upload_preset", "?");
      imageFormData.append("cloud_name", "?");

      try {
        setIsImgUploading(true);
        fetch(" your cloud end point ?", {
          method: "POST",
          body: imageFormData,
        })
          .then((res) => res.json())
          .then((data) => {
            setProfileImageLink(data.url);
            if (data.error) {
              toast.error(data?.error?.message);
              setIsImgUploading(false);
              setProfileImageLink(null);
            } else {
              setIsImgUploading(false);
            }
          })
          .catch((err) => {
            toast.error(err.message + "try again");
            setIsImgUploading(false);
          });
      } catch (error) {
        console.log(error);
        toast.error(error);
        setIsImgUploading(false);
      } finally {
        setIsImgUploading(false);
      }
    } else if (image?.size / 500000 > 5) {
      toast.error("Image size can't exceed 5mb");
      setIsImgUploading(false);
    }
  }, [image]);

  /* The `useEffect` hook in the provided code is responsible for saving an image link to the
database when the `image` state variable changes. */
  useEffect(() => {
    async function uploadImg() {
      setIsImgUploading(true);
      if (profileImageLink) {
        let imageLink = {
          id: user?._id,
          profileImg: profileImageLink,
        };
        const response = api.post("/auth/uploadimage", imageLink, {
          headers: { "Content-Type": "application/json" },
        });
        // toast.success(response.data);
        toast.promise(
          response,
          {
            loading: "Uploading image",
            success: "Image uploaded successfully!",
            error: "Upload failed try again!",
          },
          {
            position: "top-center",
            style: {
              minWidth: "250px",
            },
            success: {
              duration: 2500,
            },
          }
        );
        console.log(response);
        setProfileImageLink(null);
        setIsImgUploading(false);
        window.location.reload();
      }
    }
    uploadImg();
  }, [profileImageLink, user?._id]);

  

  return (
    <div>
      <main className=" max-w-[1200px] mx-auto xl:px-10 py-12 flex min-h-[80vh] relative">
        <section className={`flex flex-row gap-16 items-start flex-auto${isMobile ? ' flex-column' : ''}`} style={isMobile && window.innerWidth <= 600 ? { display: 'flex', flexDirection: 'column', padding: '30px' } : null}>
          {user?.profileImg ? (
            <div className="relative md:w-[320px]">
              <figure>
                <img
                  src={user?.profileImg}
                  alt="User image"
                  className={`max-w-xs rounded-full border-[1px] ${isMobile ? 'mobile-style' : 'desktop-style'}`}
                  style={isMobile && window.innerWidth <= 600 ? { marginRight: 'auto', marginLeft: 'auto', display: 'block', width: '50%' } : null}
                />
              </figure>
              <div className=" flex justify-center items-center relative">
                <label
                  htmlFor="imageUpload"
                  className="absolute flex flex-row gap-2 items-center bg-white shadow-md px-3 py-2 rounded-full -bottom-4 cursor-pointer"
                >
                  {/* <div className="absolute flex flex-row gap-2 items-center bg-white shadow-md px-3 py-2 rounded-full -bottom-4 cursor-pointer"> */}
                  {!isImageLoading ? (
                    <PulseLoader
                      color="#ff3f62ff"
                      size={10}
                      speedMultiplier={0.8}
                    />
                  ) : (
                    <>
                      <img
                        src={cameraIcon}
                        alt="Choose photo"
                        className=" w-4"
                      />
                      <p className=" text-sm text-[#222222] font-medium">Add</p>
                    </>
                  )}
                  {/* </div> */}
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
              <div className=" min-w-[214px] min-h-[214px] bg-[#222222] rounded-full flex justify-center items-center relative">
                <p className=" text-8xl text-white font-semibold mb-2">
                  {user?.name?.firstName?.slice(0, 1)}
                </p>
                <label
                  htmlFor="imageUpload"
                  className="absolute flex flex-row gap-2 items-center bg-white shadow-md px-3 py-2 rounded-full -bottom-4 cursor-pointer"
                >
                  {!isImageLoading ? (
                    <PulseLoader
                      color="#ff3f62ff"
                      size={10}
                      speedMultiplier={0.8}
                    />
                  ) : (
                    <>
                      <img
                        src={cameraIcon}
                        alt="Choose photo"
                        className=" w-4"
                      />
                      <p className=" text-sm text-[#222222] font-medium">Add</p>
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
            <UserProfileOptions
              setShowPopup={setShowPopup}
              setSelectedOption={setSelectedOption}
            />
            <UserAbout setShowPopup={setShowPopup} />
          </section>
        </section>
      </main>
      <div className=" border-t border-[#dddddd] py-5 bg-[#ffffff] w-full flex flex-row-reverse">
        <Link
          to={`/users/show/${user?._id}`}
          className="px-7 py-3 bg-[#282828] hover:bg-[#000000] text-white rounded-lg mx-6 font-medium"
          onClick={() => {
            window.reload();
          }}
        >
          Done
        </Link>
      </div>

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
