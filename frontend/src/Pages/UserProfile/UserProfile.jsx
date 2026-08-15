import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileData from "../../components/userProfile/ShowUserProfileData";
import UserReservationsSection from "../../components/userProfile/UserReservationsSection";

const UserProfile = () => {
  const user = useSelector((state) => state.user?.userDetails);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hasAnyProfileInfo =
    Boolean(user?.profileDetails?.profile && Object.values(user.profileDetails.profile).some(p => p?.value)) ||
    Boolean(user?.profileDetails?.about);

  return (
    <main className="max-w-[1200px] mx-auto px-5 sm:px-8 xl:px-10 py-12 min-h-[80vh]">
      <section
        className={`flex ${
          isMobile ? "flex-col gap-8" : "flex-row gap-16"
        } items-start w-full`}
      >
        {/* User Card */}
        <div className="w-full sm:w-[320px] shrink-0">
          <div className="flex flex-col gap-4 items-center shadow-lg dark:shadow-2xl rounded-3xl p-7 border border-[#dddddd] dark:border-[#333333] bg-white dark:bg-[#1e1e1e] sticky top-[120px]">
            {user?.profileImg ? (
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#dddddd] dark:border-[#444444]">
                <img
                  src={user.profileImg}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-[120px] h-[120px] bg-[#222222] dark:bg-[#333333] rounded-full flex justify-center items-center">
                <p className="text-4xl text-white font-semibold">
                  {user?.name?.firstName?.slice(0, 1) || "U"}
                </p>
              </div>
            )}

            <div className="flex flex-col justify-center items-center text-center">
              <h2 className="text-2xl font-semibold text-[#222222] dark:text-white">
                {user?.name?.firstName} {user?.name?.lastName !== "guest" ? user?.name?.lastName : ""}
              </h2>
              <span className="text-sm font-medium text-[#717171] dark:text-[#a0a0a0] capitalize mt-0.5">
                {user?.role === "host" ? "Host" : "Guest"}
              </span>
            </div>

            <Link
              to={`/users/show/${user?._id}/editMode=true`}
              className="mt-3 w-full text-center py-2.5 px-4 rounded-xl border border-[#222222] dark:border-[#555555] hover:bg-[#f7f7f7] dark:hover:bg-[#2a2a2a] text-sm font-medium transition-colors"
            >
              Edit profile
            </Link>
          </div>
        </div>

        {/* Profile Details or Empty State */}
        {hasAnyProfileInfo ? (
          <ProfileData />
        ) : (
          <div className="flex flex-col flex-1 justify-center items-start max-w-md py-6">
            <div className="flex flex-col gap-4 items-start">
              <h2 className="text-2xl text-[#222222] dark:text-white font-semibold">
                It&apos;s time to create your profile
              </h2>
              <p className="text-sm text-[#717171] dark:text-[#a0a0a0] leading-relaxed">
                Your Motel profile is an important part of every reservation. Create
                yours to help other Hosts and guests get to know you.
              </p>
              <Link
                to={`/users/show/${user?._id}/editMode=true`}
                className="bg-[#ff385c] hover:bg-[#d90b63] transition-all duration-300 text-white font-medium rounded-lg px-6 py-3 shadow-sm"
              >
                Create profile
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Bookings, Stays, and Cancellation / Refund Management */}
      <UserReservationsSection />
    </main>
  );
};

export default UserProfile;
