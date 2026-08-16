import { useAuth } from "../../hooks/useAuth";
import { profileOptions } from "./userProfileApi";

const ShowUserProfileData = () => {
  const { user } = useAuth();
  const userProfile = user?.profileDetails?.profile;

  const setProfileOptions = profileOptions?.filter((option) => {
    return Boolean(userProfile && userProfile[option.fieldName]?.value);
  });

  return (
    <section className="flex flex-col flex-1">
      <div className="flex flex-col gap-2 items-start">
        <h1 className="text-3xl font-semibold text-[#222222] dark:text-white">
          About {user?.name?.firstName}
        </h1>
      </div>

      {setProfileOptions && setProfileOptions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 mt-6">
          {setProfileOptions.map((option, index) => {
            const fieldValue = userProfile[option.fieldName]?.value;
            return (
              <div key={index} className="flex flex-row gap-3 items-center py-1">
                <img src={option.img} alt="Options" className="w-6 h-6 object-contain dark:invert" />
                <p className="text-base text-[#222222] dark:text-[#e5e7eb]">
                  <span className="font-medium">{option.name}:</span> {fieldValue}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {user?.profileDetails?.about && (
        <div className="mt-8 pt-6 border-t border-[#dddddd] dark:border-[#333333]">
          <h2 className="text-lg font-semibold mb-2 text-[#222222] dark:text-white">
            About me
          </h2>
          <p className="text-base text-[#484848] dark:text-[#c0c0c0] leading-relaxed">
            {user.profileDetails.about}
          </p>
        </div>
      )}
    </section>
  );
};

export default ShowUserProfileData;
