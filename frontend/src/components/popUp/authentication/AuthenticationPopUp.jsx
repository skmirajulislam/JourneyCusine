// import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import closeIcon from "../../../assets/basicIcon/closeIcon.svg";
import backIcon from "../../../assets/basicIcon/backIcon.png";

import LogInPopup from "./LogInPopup";
import CreateUserPopup from "./CreateUserPopup";
import WelcomePopup from "./WelcomePopup";
import CreateProfilePopup from "./CreateProfilePopup";

// eslint-disable-next-line react/prop-types
const AuthenticationPopUp = ({ popup, setPopup }) => {
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [defaultPopup, setDefaultPopup] = useState(true);
  const [loginEmail, setLoginEmail] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const popUpRef = useRef(null);

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
    setShowCreateUserPopup(false);
    setDefaultPopup(true);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popUpRef.current && !popUpRef.current.contains(event.target)) {
        setPopup(false);
        setShowCreateUserPopup(false);
        setShowLoginPopup(false);
        setProfilePopup(false);
        setDefaultPopup(true);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <>
      {popup !== true ? null : (
        <div className=" absolute inset-0 w-screen h-screen bg-[#0000005c] popup__overlay">
          <div
            ref={popUpRef}
            className={`absolute left-[27.5%] right-[27.5%] top-[12%] ${
              (showLoginPopup || profilePopup) && !showErrorMessage
                ? " h-[60vh] popup__container__login"
                : (showLoginPopup || profilePopup) && showErrorMessage
                ? "h-[80vh]"
                : "h-[80vh] popup__container"
            } w-[45vw] bg-[#ffffff] shadow-2xl rounded-xl overflow-hidden`}
            style={{height:'65vh', width: '40vh', left:'calc(50% - (20vh) + 5px)'}}
          >
            {/* pop-up navbar */}
            <div className=" flex items-center w-full py-4 border-b-[1px] px-8 sticky top-0 bg-[#ffffff]">
              {defaultPopup || profilePopup ? (
                <img
                  src={closeIcon}
                  alt="close icon"
                  className="w-8 hover:bg-[#f1f1f1] transition-colors rounded-full p-2 cursor-pointer"
                  onClick={() => {
                    setPopup(false);
                  }}
                />
              ) : (
                <img
                  src={backIcon}
                  alt="close icon"
                  className="w-8 hover:bg-[#f1f1f1] transition-colors rounded-full p-2 cursor-pointer"
                  onClick={() => {
                    handleCloseLoginPopup();
                  }}
                />
              )}
              <p className="text-base mx-auto font-semibold text-[#222222]">
                {defaultPopup
                  ? "Log in or sign up"
                  : showLoginPopup
                  ? "Log in"
                  : showCreateUserPopup
                  ? "Finish signing up"
                  : profilePopup
                  ? "Create your profile"
                  : "Log in or sign up"}
              </p>
              <div className="w-[14px]"> </div>
            </div>
            <div
              className={`overflow-y-auto ${
                showLoginPopup ? "h-[60vh]" : "h-[70vh]"
              }`}
            >
              {!defaultPopup ? null : (
                <WelcomePopup
                  setDefaultPopup={setDefaultPopup}
                  setShowLoginPopup={setShowLoginPopup}
                  setShowCreateUserPopup={setShowCreateUserPopup}
                  setLoginEmail={setLoginEmail}
                />
              )}
              {!showLoginPopup ? null : (
                <LogInPopup
                  onBack={handleCloseLoginPopup}
                  loginEmail={loginEmail}
                  setDefaultPopup={setDefaultPopup}
                  setShowLoginPopup={setShowLoginPopup}
                  setPopup={setPopup}
                  showErrorMessage={showErrorMessage}
                  setShowErrorMessage={setShowErrorMessage}
                />
              )}
              {!showCreateUserPopup ? null : (
                <CreateUserPopup
                  onBack={handleCloseLoginPopup}
                  loginEmail={loginEmail}
                  setProfilePopup={setProfilePopup}
                  showCreatePopUp={setShowCreateUserPopup}
                  setPopup={setPopup}
                />
              )}
              {!profilePopup ? null : (
                <CreateProfilePopup
                  setShowProfilePopup={setProfilePopup}
                  setPopup={setPopup}
                  setDefaultPopup={setDefaultPopup}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AuthenticationPopUp;
