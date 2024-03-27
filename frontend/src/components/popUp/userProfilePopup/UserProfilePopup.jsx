/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { PulseLoader } from "react-spinners";
import closeIcon from "../../../assets/basicIcon/closeIcon.svg";
import api from "../../../backend";

const UserProfilePopup = ({ showPopup, setShowPopup, popupData }) => {
  console.log(popupData);
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, register, watch } = useForm();
  const popUpRef = useRef(null);
  const inputFieldName = popupData?.name;
  const inputValue = watch(inputFieldName);

  const fieldName = popupData?.fieldName;

  const handleProfileValue = async (data) => {
    const valueName = Object.keys(data);
    const value = Object.values(data);
    const sendDataToBackend = { valueName, value, fieldName };
    try {
      setIsLoading(true);
      const responseOfPostingProfileData = await api.post(
        "/auth/profile_details",
        sendDataToBackend,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(responseOfPostingProfileData);
      if (responseOfPostingProfileData.status === 200) {
        setTimeout(() => {
          setShowPopup(false);
        }, 150);
      }
      toast.success(responseOfPostingProfileData.data.message);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup]);

  useEffect(() => {
    const count = inputValue?.replace(/\s/g, " ").length;
    setCharacterCount(count);
  }, [inputValue]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popUpRef.current && !popUpRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [setShowPopup]);

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


  return (
    <>
      {!showPopup ? null : (
        <div className=" absolute inset-0 w-full bg-[#0000005c] popup__overlay z-[100]">
          <div
            ref={popUpRef}
            className={`absolute left-[27.5%] right-[27.5%] top-[12%] h-[65vh] profile__popup__container w-[45vw] bg-[#ffffff] shadow-2xl rounded-xl overflow-hidden ${isMobile ? 'flex flex-col' : ''}`}
            style={isMobile && window.innerWidth <= 600 ? { width:'55%', height:'70vh'} : null}
          >
            <form onSubmit={handleSubmit(handleProfileValue)} >
              <div className=" flex flex-row justify-between items-center py-3 px-5 mb-2">
                <img
                  src={closeIcon}
                  alt="close icon"
                  className="w-8 hover:bg-[#f1f1f1] transition-colors rounded-full p-2 cursor-pointer"
                  onClick={() => {
                    setShowPopup(false);
                  }}
                />
                <div className=" w-6"> </div>
              </div>
              <div className=" px-7">
                <h1 className=" text-2xl text-[#222222] font-medium">
                  {popupData?.popUpContent?.header}
                </h1>
                <p className=" text-base text-[#717171] mt-2">
                  {popupData?.popUpContent?.subHead}
                </p>
              </div>
              <div className=" px-7 pb-2">
                <input
                  type="text"
                  placeholder={popupData?.name}
                  className="w-full mt-9 px-4 py-4 rounded-lg border-[1.4px] border-[#b0b0b0]"
                  {...register(inputFieldName, {
                    required: true,
                    maxLength: 40,
                  })}
                />
                <p
                  className={` text-xs font-semibold mt-1 flex flex-row-reverse ${
                    characterCount > 40 ? " text-red-400" : "text-[#717171]"
                  }`}
                >
                  {characterCount}/40 characters
                </p>
              </div>
              <div
                className="py-3 flex flex-row-reverse border-t border-[#dddddd] mt-5 absolute bottom-0  
               w-full"
              >
                <button
                  className={`px-7 py-3 bg-[#282828] hover:bg-[#000000] text-white rounded-lg mx-6 font-  
                   medium disabled:bg-[#dddddd] ${
                     isLoading || characterCount > 40
                       ? " cursor-not-allowed"
                       : ""
                   }`}
                  type="submit"
                  disabled={isLoading || characterCount > 40}
                >
                  {isLoading ? (
                    <PulseLoader
                      color="#f7f7f7"
                      size={7}
                      margin={4}
                      speedMultiplier={0.6}
                    />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfilePopup;
