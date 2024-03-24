import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { profileOptions } from "./userProfileApi";

const ShowUserProfileData = () => {
  const user = useSelector((state) => state.user?.userDetails);

  const userProfile = user?.profileDetails?.profile;
  const filteredNewOptions = profileOptions?.filter((option) => {
    return userProfile && Object.keys(userProfile)?.includes(option.fieldName);
  });

  const values = userProfile && Object.entries(user?.profileDetails?.profile).map(([key, value]) => {
    console.log(key)
    return value.value;
  });

  return (
    <section className=" flex flex-col">
      <div className=" flex flex-col gap-5 items-start">
        <h1 className=" text-[32px] font-semibold">
          About {user?.name.firstName}
        </h1>
        <Link
          to={`/users/show/${user?._id}/editMode=true`}
          className=" bg-white hover:bg-[#f7f7f7] transition-all duration-300 font-medium rounded-lg px-3 py-2 border-[1.3px] border-black text-[#222222] text-sm"
          type="submit"
        >
          Edit Details
        </Link>
      </div>
      <div className=" grid grid-cols-2 gap-x-16 gap-y-4 mt-6">
        {filteredNewOptions.map((option, index) => {
          return (
            <div key={index} className=" flex flex-row gap-3 items-center py-1">
              <img src={option.img} alt="Options" className=" w-7" />
              <p className="text-base text-[#222222]">
                {option.name} : {values[index]}
              </p>
            </div>
          );
        })}
      </div>
      <p className=" mt-8 text-[#222222] text-base">
        {user?.profileDetails?.about}
      </p>
    </section>
  );
};

export default ShowUserProfileData;
