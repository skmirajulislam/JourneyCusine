import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import LogInPopup from "./LogInPopup";
import CreateUserPopup from "./CreateUserPopup";
import WelcomePopup from "./WelcomePopup";
import CreateProfilePopup from "./CreateProfilePopup";

 
const AuthenticationPopUp = ({ popup, setPopup }) => {
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [defaultPopup, setDefaultPopup] = useState(true);
  const [loginEmail, setLoginEmail] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
    setShowCreateUserPopup(false);
    setDefaultPopup(true);
  };

  const handleClose = () => {
    setPopup(false);
    setShowCreateUserPopup(false);
    setShowLoginPopup(false);
    setProfilePopup(false);
    setDefaultPopup(true);
  };

  // Reset internal state when dialog opens
  useEffect(() => {
    if (popup) {
      setDefaultPopup(true);
      setShowLoginPopup(false);
      setShowCreateUserPopup(false);
      setProfilePopup(false);
    }
  }, [popup]);

  const titleText = defaultPopup
    ? "Log in or sign up"
    : showLoginPopup
    ? "Log in"
    : showCreateUserPopup
    ? "Finish signing up"
    : profilePopup
    ? "Create your profile"
    : "Log in or sign up";

  return (
    <Dialog open={popup} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <AnimatePresence>
        {popup && (
          <DialogPortal forceMount>
            <DialogOverlay />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <DialogPrimitive.Content asChild onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  className="pointer-events-auto w-full max-w-[420px] max-h-[88vh] bg-white dark:bg-[#1e1e1e] shadow-2xl rounded-2xl overflow-hidden border border-[#eeeeee] dark:border-[#333333] focus:outline-none flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between w-full py-4 border-b border-[#dddddd] dark:border-[#333333] px-6 sticky top-0 bg-white dark:bg-[#1e1e1e] z-10 shrink-0">
                    {defaultPopup || profilePopup ? (
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-[#222222] dark:text-white"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCloseLoginPopup}
                        className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-[#222222] dark:text-white"
                        aria-label="Back"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <p className="text-base font-semibold text-[#222222] dark:text-[#e5e7eb] text-center flex-1">
                      {titleText}
                    </p>
                    <div className="w-[32px]"> </div>
                  </div>

                  {/* Content with animated transitions */}
                  <div className="overflow-y-auto flex-1 w-full">
                    <AnimatePresence mode="wait">
                      {defaultPopup && (
                        <motion.div
                          key="welcome"
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 15 }}
                          transition={{ duration: 0.18 }}
                        >
                          <WelcomePopup
                            setDefaultPopup={setDefaultPopup}
                            setShowLoginPopup={setShowLoginPopup}
                            setShowCreateUserPopup={setShowCreateUserPopup}
                            setLoginEmail={setLoginEmail}
                          />
                        </motion.div>
                      )}
                      {showLoginPopup && (
                        <motion.div
                          key="login"
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.18 }}
                        >
                          <LogInPopup
                            onBack={handleCloseLoginPopup}
                            loginEmail={loginEmail}
                            setDefaultPopup={setDefaultPopup}
                            setShowLoginPopup={setShowLoginPopup}
                            setPopup={setPopup}
                            showErrorMessage={showErrorMessage}
                            setShowErrorMessage={setShowErrorMessage}
                          />
                        </motion.div>
                      )}
                      {showCreateUserPopup && (
                        <motion.div
                          key="signup"
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.18 }}
                        >
                          <CreateUserPopup
                            onBack={handleCloseLoginPopup}
                            loginEmail={loginEmail}
                            setProfilePopup={setProfilePopup}
                            showCreatePopUp={setShowCreateUserPopup}
                            setPopup={setPopup}
                          />
                        </motion.div>
                      )}
                      {profilePopup && (
                        <motion.div
                          key="profile"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.18 }}
                        >
                          <CreateProfilePopup
                            setShowProfilePopup={setProfilePopup}
                            setPopup={setPopup}
                            setDefaultPopup={setDefaultPopup}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
export default AuthenticationPopUp;
