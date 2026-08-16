/* eslint-disable react/prop-types */
import { useAuth } from "../../hooks/useAuth";
import { profileOptions } from "./userProfileApi";

const UserProfileOptions = ({ setShowPopup, setSelectedOption }) => {
  const { user } = useAuth();
  const userProfile = user?.profileDetails?.profile;

  return (
    <>
      <div className="flex flex-col">
        <div>
          <h1 className="text-[#222222] dark:text-white text-[32px] font-semibold">
            Your profile
          </h1>
          <div className="text-base text-[#717171] dark:text-[#a0a0a0] max-w-[85%] mt-3">
            The information you share will be used across Motel to help other
            guests and Hosts get to know you.
          </div>
        </div>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 mt-4">
          {profileOptions.map((option, i) => {
            const savedProfileData = userProfile?.[option.fieldName];
            return (
              <div
                key={i}
                className="border-b border-[#dedede] dark:border-[#333333] cursor-pointer"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setSelectedOption(option);
                  setShowPopup(true);
                }}
              >
                <div className="flex flex-row gap-3 items-center py-5 px-2 hover:bg-[#f7f7f7] dark:hover:bg-[#2a2a2a] rounded-xl transition-colors">
                  <img src={option.img} alt="Options" className="w-6 h-6 object-contain dark:invert" />
                  {savedProfileData?.value ? (
                    <div className="text-base text-[#222222] dark:text-[#e5e7eb]">
                      <p>
                        <span className="font-medium text-[#717171] dark:text-[#a0a0a0]">{option.name}:</span>{" "}
                        {savedProfileData.value}
                      </p>
                    </div>
                  ) : (
                    <p className="text-base text-[#717171] dark:text-[#a0a0a0] hover:text-[#222222] dark:hover:text-white">
                      + Add {option.name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
};

export default UserProfileOptions;
