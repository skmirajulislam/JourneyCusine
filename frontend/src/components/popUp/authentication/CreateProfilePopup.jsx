/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import motelLogo from "../../../assets/basicIcon/motel-logo.png";

const CreateProfilePopup = ({
  setShowProfilePopup,
  setPopup,
  setDefaultPopup,
}) => {
  const { user } = useAuth();
  const userId = user?._id;

  return (
    <div className="flex flex-col gap-4">
      <div className="px-8 pt-1 bg-[#fafafa] dark:bg-[#1e1e1e] h-[60vh]">
        <div className="flex flex-col gap-3 justify-center items-center max-w-[35vw] pt-6 text-[#222222] dark:text-white mx-auto">
          <img src={motelLogo} alt="Motel Logo" className="w-10" />
          <h4 className="text-2xl font-semibold">Welcome to Journey Cuisine</h4>
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Discover places to stay and unique experiences around the world.
          </p>
        </div>
        <div className="px-5 mt-5 w-full flex justify-center">
          <Link
            to={userId ? `/users/show/${userId}` : "/"}
            className="bg-[#282828] dark:bg-neutral-800 text-[#ffffff] text-center font-medium block w-full py-2.5 rounded-xl hover:bg-[#000000] dark:hover:bg-neutral-700 transition-colors duration-300 shadow-md"
            onClick={() => {
              setShowProfilePopup(false);
              setPopup(false);
              setDefaultPopup(true);
            }}
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateProfilePopup;
