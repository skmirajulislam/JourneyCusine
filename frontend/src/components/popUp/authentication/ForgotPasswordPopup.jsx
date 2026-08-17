import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { PulseLoader } from "react-spinners";
import axios from "axios";
import { API } from "../../../backend";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { FiPhone, FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";

const ForgotPasswordPopup = ({
  loginEmail,
  onBackToLogin,
  onSuccessClose,
}) => {
  const { setUser } = useAuth();
  const [step, setStep] = useState(1); // 1: Verify Phone, 2: Reset Password
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPasswordValue = watch("newPassword", "");

  // Step 1: Verify Phone Number
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await axios.post(`${API}auth/forgot_password/verify_phone`, {
        email: loginEmail,
        phoneNumber: phoneNumber.trim(),
      });

      if (res.data?.success === 1) {
        setVerifiedPhone(phoneNumber.trim());
        setStep(2);
        toast.success("Phone number verified! You can now set a new password.");
      } else {
        setErrorMessage(res.data?.message || "Phone number does not match our records.");
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      setErrorMessage(
        error.response?.data?.message || "Phone number does not match registered account."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await axios.post(`${API}auth/forgot_password/reset_password`, {
        email: loginEmail,
        phoneNumber: verifiedPhone,
        newPassword: data.newPassword,
      });

      if (res.data?.success === 1) {
        const userData = res.data;
        if (userData?.accessToken) {
          localStorage.setItem("accessToken", JSON.stringify(userData.accessToken));
        }
        if (userData?.refreshToken) {
          localStorage.setItem("refreshToken", JSON.stringify(userData.refreshToken));
        }
        if (userData?.user_details) {
          setUser(userData);
        }
        toast.success("🎉 Password updated successfully! Logged in.");
        onSuccessClose();
      } else {
        setErrorMessage(res.data?.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-5 sm:px-8 py-2">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#222222] dark:text-white">
                Verify Your Account
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Enter the phone number registered for <span className="font-semibold text-neutral-800 dark:text-neutral-200">{loginEmail}</span> to securely reset your password.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
                <FiAlertCircle className="shrink-0 w-4 h-4 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPhone} className="flex flex-col gap-3.5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <FiPhone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210 or +91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <PulseLoader color="#ffffff" size={7} />
                ) : (
                  "Verify Phone Number"
                )}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="text-xs text-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer py-1"
              >
                Back to log in
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
                <FiCheckCircle className="w-4 h-4" />
                <span>Phone Verified Successfully</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#222222] dark:text-white">
                Create New Password
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Set a strong password of at least 8 characters.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
                <FiAlertCircle className="shrink-0 w-4 h-4 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(handleResetPassword)} className="flex flex-col gap-3">
              {/* New Password */}
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <FiLock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    {...register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="text-[11px] text-red-500">{errors.newPassword.message}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <FiLock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (val) =>
                        val === newPasswordValue || "Passwords do not match",
                    })}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-[11px] text-red-500">{errors.confirmPassword.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-1 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <PulseLoader color="#ffffff" size={7} />
                ) : (
                  "Update Password & Log In"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer py-1"
              >
                Back to phone verification
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPasswordPopup;
