/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { API } from "../../../backend";
import { PulseLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaInstagram } from "react-icons/fa";

const WelcomePopup = ({
  setDefaultPopup,
  setShowLoginPopup,
  setShowCreateUserPopup,
  setLoginEmail,
}) => {
  const [inputFocused, setInputFocused] = useState(false);
  const { handleSubmit, register, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  const handleCheckEmail = async (data) => {
    const email = data.email;
    setLoginEmail(email);
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API}auth/check_email`,
        {
          email: email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response?.data;
      if (responseData?.success === 1) {
        setDefaultPopup(false);
        setShowLoginPopup(true);
      }
      if (responseData?.success === 0) {
        setDefaultPopup(false);
        setShowCreateUserPopup(true);
      }
      setTimeout(() => {
        reset();
      }, 300);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      toast.error("Google login requires VITE_GOOGLE_CLIENT_ID in your .env file!");
      return;
    }
    toast.success("Connecting to Google authentication...");
  };

  const handleFacebookLogin = () => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!facebookAppId) {
      toast.error("Facebook login requires VITE_FACEBOOK_APP_ID in your .env file!");
      return;
    }
    toast.success("Connecting to Facebook authentication...");
  };

  const handleInstagramLogin = () => {
    const instagramClientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
    if (!instagramClientId) {
      toast.error("Instagram login requires VITE_INSTAGRAM_CLIENT_ID in your .env file!");
      return;
    }
    toast.success("Connecting to Instagram authentication...");
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* welcome option */}
      <div className="px-8 pt-4">
        <h2 className="font-medium text-[22px] text-[#222222] dark:text-[#e5e7eb]">
          Welcome to Motel
        </h2>
        <form onSubmit={handleSubmit(handleCheckEmail)}>
          <input
            type="email"
            placeholder="Email"
            className={`w-full border-[1.5px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#2a2a2a] text-[#222222] dark:text-[#e5e7eb] placeholder:text-[#717171] dark:placeholder:text-[#888888] p-3 rounded-lg mt-4 ${
              inputFocused ? "placeholder-shrink" : "placeholder-restore"
            }`}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            {...register("email", {
              required: true,
              onBlur: handleInputBlur,
            })}
          />
          <div className=" pt-4 px-8 italic">
            <ul className=" list-disc text-xs text-[#222222] dark:text-[#e5e7eb] opacity-80">
              <p>You can use below test credentials to login!</p>
              <li>email: guest@email.com</li>
            </ul>
          </div>
          <p className=" text-xs text-[#222222] dark:text-[#e5e7eb] pt-3 mb-5 opacity-80 ml-[2px]">
            We’ll send a confirmation email to verify your email address. <br />{" "}
            <Link className=" font-semibold underline">Privacy Policy</Link>
          </p>
          <button
            className={`bg-[#ff385c] hover:bg-[#d90b63] transition-all duration-300 text-white font-medium rounded-lg p-3 w-full disabled:bg-[#dddddd] ${
              isLoading ? " cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <PulseLoader
                color="#f7f7f7"
                size={7}
                margin={4}
                speedMultiplier={0.6}
              />
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>

      {/* divider */}
      <div className="flex flex-row items-center px-8 my-1">
        <div className="h-[1.2px] w-full inline-block bg-[#dddddd] dark:bg-[#333333]"></div>
        <p className="inline-block text-xs mx-2 text-[#717171] dark:text-[#a0a0a0]">or</p>
        <div className="h-[1.2px] w-full inline-block bg-[#dddddd] dark:bg-[#333333]"></div>
      </div>

      {/* social logins */}
      <div className="flex flex-col gap-3 px-8 pb-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex flex-row items-center justify-center gap-3 border border-[#222222] dark:border-[#444444] rounded-lg py-[10px] bg-white dark:bg-[#2a2a2a] hover:bg-[#f7f7f7] dark:hover:bg-[#383838] transition-colors cursor-pointer"
        >
          <FcGoogle size={20} />
          <span className="text-sm font-medium text-[#222222] dark:text-[#e5e7eb]">
            Continue with Google
          </span>
        </button>

        <button
          type="button"
          onClick={handleFacebookLogin}
          className="w-full flex flex-row items-center justify-center gap-3 border border-[#222222] dark:border-[#444444] rounded-lg py-[10px] bg-white dark:bg-[#2a2a2a] hover:bg-[#f7f7f7] dark:hover:bg-[#383838] transition-colors cursor-pointer"
        >
          <FaFacebook size={20} className="text-[#1877F2]" />
          <span className="text-sm font-medium text-[#222222] dark:text-[#e5e7eb]">
            Continue with Facebook
          </span>
        </button>

        <button
          type="button"
          onClick={handleInstagramLogin}
          className="w-full flex flex-row items-center justify-center gap-3 border border-[#222222] dark:border-[#444444] rounded-lg py-[10px] bg-white dark:bg-[#2a2a2a] hover:bg-[#f7f7f7] dark:hover:bg-[#383838] transition-colors cursor-pointer"
        >
          <FaInstagram size={20} className="text-[#E4405F]" />
          <span className="text-sm font-medium text-[#222222] dark:text-[#e5e7eb]">
            Continue with Instagram
          </span>
        </button>
      </div>
    </div>
  );
};

export default WelcomePopup;
