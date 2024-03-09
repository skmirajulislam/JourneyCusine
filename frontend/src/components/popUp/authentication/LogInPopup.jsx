/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { API } from "../../../backend";
import { useDispatch, useSelector } from "react-redux";
import { userLogIn } from "../../../redux/actions/userActions";
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
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state) => state.user);
  console.log(user);
  const dispatch = useDispatch();

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
        dispatch(userLogIn(userData));
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
          console.log(refreshToken);
          localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
        }
        window.location.reload();
        setShowLoginPopup(false);
        setDefaultPopup(true);
        setPopup(false);
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
      <div className="px-8 pt-1">
        {!showErrorMessage ? null : (
          <div className=" flex flex-row items-center gap-3 px-3 py-2 border-[#dddddd] border rounded-xl mt-6 mb-3">
            <img src={errorMessageIcon} alt="Error icon" className=" w-14" />
            <div className=" flex flex-col gap-[2px]">
              <h6 className=" text-sm text-[#222222] font-semibold">
                {/* // &apos; is basically this sign ' */}
                Let&apos;s try that again
              </h6>
              <p className=" text-sm text-[#717171] opacity-80">
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
              className="w-full border-[1.5px] border-[#dddddd] p-3 rounded-lg transition-all duration-300"
              {...register("password", {
                required: true,
                pattern: /^.{8,}$/,
              })}
              onChange={handleShowError}
            />
            <span
              className={`absolute ${
                errors.password ? "top-[35%]" : "top-[50%]"
              }  right-3 transform -translate-y-1/2 text-[#222222] text-xs font-semibold underline cursor-pointer`}
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? "Hide" : "Show"}
            </span>
            {errors.password && (
              <div
                role="alert"
                className=" flex flex-row items-center gap-2 mt-1"
              >
                <img
                  src={errorIcon}
                  alt="Last name is requires"
                  className="w-5"
                />
                <p className="text-xs text-[#c13515]">
                  At least 8 characters long
                </p>
              </div>
            )}
          </div>
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
              "Log in"
            )}
          </button>
        </form>
      </div>
      <Link className=" text-[#222222] text-sm font-medium underline pt-3 px-8">
        Forgot Password?
      </Link>

      <div className=" pt-4 px-8 italic pb-7">
        <ul className=" list-disc text-xs text-[#222222] opacity-80">
          <p>You can use below test credentials to login!</p>
          <li>Password: guest1234</li>
        </ul>
      </div>
    </div>
  );
};

export default LogInPopup;
