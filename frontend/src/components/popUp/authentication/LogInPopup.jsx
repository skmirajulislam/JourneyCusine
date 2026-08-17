 
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { API } from "../../../backend";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import errorIcon from "../../../assets/basicIcon/errorIcon.png";
import errorMessageIcon from "../../../assets/basicIcon/errorIcon2.png";

const LogInPopup = ({
  loginEmail,
  setShowLoginPopup,
  setPopup,
  setDefaultPopup,
  setShowErrorMessage,
  showErrorMessage,
  onForgotPassword,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useAuth();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleShowError = () => {
    setShowErrorMessage(false);
  };

  const handleLogin = async (data) => {
    setIsLoading(true);
    setShowErrorMessage(false);
    try {
      const response = await axios.post(`${API}auth/log_in`, {
        email: loginEmail,
        password: data.password,
      });
      const userData = response.data;
      setIsLoading(false);

      if (userData?.success === 0) {
        setShowErrorMessage(true);
      } else if (userData?.success === 1) {
        setUser(userData);
        let accessToken = localStorage.getItem("accessToken");
        let refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken) {
          localStorage.setItem(
            "accessToken",
            JSON.stringify(userData?.accessToken)
          );
        } else if (accessToken) {
          accessToken = userData?.accessToken;
          localStorage.setItem("accessToken", JSON.stringify(accessToken));
        }
        if (!refreshToken) {
          localStorage.setItem(
            "refreshToken",
            JSON.stringify(userData?.refreshToken)
          );
        } else if (refreshToken) {
          refreshToken = userData?.refreshToken;
          localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
        }
        setShowLoginPopup(false);
        setDefaultPopup(true);
        setPopup(false);
        toast.success("Welcome back!");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.warn("Network error try again!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 sm:px-8 pt-1">
        {!showErrorMessage ? null : (
          <div className="flex flex-row items-center gap-3 px-3.5 py-2.5 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 rounded-xl mt-4 mb-3">
            <img src={errorMessageIcon} alt="Error icon" className="w-10 shrink-0" />
            <div className="flex flex-col gap-[2px]">
              <h6 className="text-sm text-red-700 dark:text-red-300 font-semibold">
                Let&apos;s try that again
              </h6>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">
                Invalid login credentials. Please try again.
              </p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(handleLogin)}>
          <div className="relative my-4">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="w-full border-[1.5px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#2a2a2a] text-[#222222] dark:text-[#e5e7eb] placeholder:text-[#717171] dark:placeholder:text-[#888888] p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
              {...register("password", {
                required: true,
                pattern: /^.{8,}$/,
              })}
              onChange={handleShowError}
            />
            <span
              className={`absolute ${
                errors.password ? "top-[35%]" : "top-[50%]"
              } right-3.5 transform -translate-y-1/2 text-[#222222] dark:text-[#e5e7eb] text-xs font-semibold underline cursor-pointer`}
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? "Hide" : "Show"}
            </span>
            {errors.password && (
              <div
                role="alert"
                className="flex flex-row items-center gap-2 mt-1.5"
              >
                <img
                  src={errorIcon}
                  alt="Error"
                  className="w-4"
                />
                <p className="text-xs text-[#c13515]">
                  At least 8 characters long
                </p>
              </div>
            )}
          </div>
          <button
            className={`bg-[#ff385c] hover:bg-[#d90b63] transition-all duration-300 text-white font-semibold rounded-xl p-3 w-full shadow-md disabled:bg-[#dddddd] cursor-pointer ${
              isLoading ? "cursor-not-allowed" : ""
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
              "Log in"
            )}
          </button>
        </form>
        <div className="flex flex-col gap-2 my-4">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-[#222222] dark:text-[#e5e7eb] font-semibold underline hover:text-[#ff385c] transition-colors text-left cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
      </div>
      <div className=" pt-4 px-8 italic pb-7">
        <ul className=" list-disc text-xs text-[#222222] dark:text-[#e5e7eb] opacity-80">
          <p>You can use below test credentials to login!</p>
          <li>Password: guest1234</li>
        </ul>
      </div>
    </div>
  );
};

export default LogInPopup;
