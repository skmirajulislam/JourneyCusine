/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import errorIcon from "../../../assets/basicIcon/errorIcon.png";
import { API } from "../../../backend";
import { useAuth } from "../../../hooks/useAuth";

const CreateUserPopup = ({
  loginEmail,
  setProfilePopup,
  showCreatePopUp,
  setPopup,
}) => {
  const [inputDateFocused, setInputDateFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { setUser } = useAuth();

  const handleDateFocus = () => {
    setInputDateFocused(true);
  };

  const handleDateBlur = () => {
    setInputDateFocused(false);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleCreateUser = async (data) => {
    let user = {
      name: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      emailId: data.email,
      birthDate: data.birthDate,
      password: data.password,
    };
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}auth/sign_up`, user, {
        headers: { "Content-Type": "application/json" },
      });

      const responseData = response?.data;
      setUser(responseData);
      let accessToken = localStorage.getItem("accessToken");
      let refreshToken = localStorage.getItem("refreshToken");
      if (responseData?.success === 1) {
        toast.success(responseData.info);
        if (!accessToken) {
          localStorage.setItem(
            "accessToken",
            JSON.stringify(responseData?.accessToken)
          );
        } else if (accessToken) {
          accessToken = responseData?.accessToken;
          localStorage.setItem("accessToken", JSON.stringify(accessToken));
        }
        if (!refreshToken) {
          localStorage.setItem(
            "refreshToken",
            JSON.stringify(responseData?.refreshToken)
          );
        } else if (refreshToken) {
          refreshToken = responseData?.refreshToken;
          localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
        }
        showCreatePopUp(false);
        setPopup(false);
        setTimeout(() => {
          setProfilePopup(true);
          setPopup(true);
        }, 3000);
      }
      setTimeout(() => {
        reset();
      }, 100);
    } catch (error) {
      console.log(error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.error("Network error try again later!");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-6 pt-2">
      <form
        onSubmit={handleSubmit(handleCreateUser)}
        className="px-5 sm:px-8 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2.5">
          <input
            type="text"
            className="w-full border-[1.5px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#2a2a2a] text-[#222222] dark:text-[#e5e7eb] placeholder:text-[#717171] dark:placeholder:text-[#888888] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
            placeholder="First name"
            {...register("firstName", { required: true, maxLength: 40 })}
            aria-invalid={errors.firstName ? "true" : "false"}
          />
          <input
            type="text"
            className="w-full border-[1.5px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#2a2a2a] text-[#222222] dark:text-[#e5e7eb] placeholder:text-[#717171] dark:placeholder:text-[#888888] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
            placeholder="Last name"
            {...register("lastName", { required: true, maxLength: 40 })}
            aria-invalid={errors.lastName ? "true" : "false"}
          />
          {errors.firstName?.type === "required" &&
            errors.lastName?.type === "required" && (
              <div
                role="alert"
                className="flex flex-row items-center gap-2"
              >
                <img
                  src={errorIcon}
                  alt="Name is required"
                  className="w-4"
                />
                <p className="text-xs text-[#c13515]">Name is required</p>
              </div>
            )}
          <p
            className={`text-xs text-[#717171] dark:text-[#a0a0a0] ${
              errors.firstName || errors.lastName ? "hidden" : "block"
            }`}
          >
            Make sure it matches the name on your government ID.
          </p>
        </div>

        <div>
          <input
            className="w-full border-[1.5px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#2a2a2a] text-[#222222] dark:text-[#e5e7eb] placeholder:text-[#717171] dark:placeholder:text-[#888888] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
            type={`${inputDateFocused ? "date" : "text"}`}
            aria-invalid={errors.birthDate ? "true" : "false"}
            placeholder="Birthdate"
            onFocus={handleDateFocus}
            onBlur={handleDateBlur}
            {...register("birthDate", {
              required: true,
              onBlur: handleDateBlur,
            })}
          />
          {errors.birthDate?.type === "required" && (
            <div
              role="alert"
              className="flex flex-row items-center gap-2 mt-1"
            >
              <img
                src={errorIcon}
                alt="Birthdate is required"
                className="w-4"
              />
              <p className="text-xs text-[#c13515]">Birth date is required</p>
            </div>
          )}
          <p
            className={`text-xs text-[#717171] dark:text-[#a0a0a0] mt-1 ${
              errors.birthDate ? "hidden" : "block"
            }`}
          >
            To sign up, you need to be at least 18. Your birthday won’t be
            shared with other people.
          </p>
        </div>

        <div>
          <input
            className="w-full border-[1.5px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#2a2a2a] text-[#222222] dark:text-[#e5e7eb] placeholder:text-[#717171] dark:placeholder:text-[#888888] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
            type="email"
            defaultValue={loginEmail}
            placeholder="Email"
            {...register("email", { required: true })}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email?.type === "required" && (
            <div
              role="alert"
              className="flex flex-row items-center gap-2 mt-1"
            >
              <img
                src={errorIcon}
                alt="Email is required"
                className="w-4"
              />
              <p className="text-xs text-[#c13515]">Email is required</p>
            </div>
          )}
          <p
            className={`text-xs text-[#717171] dark:text-[#a0a0a0] mt-1 ${
              errors.email ? "hidden" : "block"
            }`}
          >
            We&apos;ll email you trip confirmations and receipts.
          </p>
        </div>

        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            className="w-full border-[1.5px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#2a2a2a] text-[#222222] dark:text-[#e5e7eb] placeholder:text-[#717171] dark:placeholder:text-[#888888] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
            {...register("password", {
              required: true,
              pattern: /^(?=.*[a-z]).{8,}$/,
            })}
          />
          <span
            className="absolute top-[36%] right-3.5 transform -translate-y-1/2 text-[#222222] dark:text-[#e5e7eb] text-xs font-semibold underline cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? "Hide" : "Show"}
          </span>
          {errors.password && (
            <div
              role="alert"
              className="flex flex-row items-center gap-2 mt-1"
            >
              <img
                src={errorIcon}
                alt="Password requirement"
                className="w-4"
              />
              <p className="text-xs text-[#c13515]">
                At least 8 characters &amp; contains a number or symbol
              </p>
            </div>
          )}
          <p
            className={`text-xs text-[#717171] dark:text-[#a0a0a0] mt-1 ${
              errors.password ? "hidden" : "block opacity-80"
            }`}
          >
            At least 8 characters long
          </p>
        </div>

        <div>
          <span className="text-[#717171] dark:text-[#a0a0a0] text-xs leading-relaxed">
            By selecting{" "}
            <span className="font-semibold text-[#222222] dark:text-white">
              Agree and continue
            </span>
            , I agree to the{" "}
            <Link
              to="/terms"
              target="_blank"
              className="text-[#ff385c] underline font-semibold hover:text-[#d90b63] transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and acknowledge the{" "}
            <Link
              to="/privacy"
              target="_blank"
              className="text-[#ff385c] underline font-semibold hover:text-[#d90b63] transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </div>

        <div className="pt-2">
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
              "Agree and continue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPopup;
