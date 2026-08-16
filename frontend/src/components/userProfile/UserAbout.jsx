import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import api from "../../backend";
import { useAuth } from "../../hooks/useAuth";

const UserAbout = () => {
  const { user: userDetails, setUser } = useAuth();
  const [showAboutInput, setShowAboutInput] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aboutData, setAboutData] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const user = userDetails?.profileDetails;

  const handleAboutForm = async (data) => {
    const sendingData = { ...data, fieldName: "about" };
    try {
      setIsLoading(true);
      const postUserAboutData = await api.post(
        "/auth/profile_details_about",
        sendingData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (postUserAboutData.data?.user_details) {
        setUser(postUserAboutData.data.user_details);
      }
      toast.success(postUserAboutData.data?.message || "About section updated!");
      setTimeout(() => {
        reset();
        setShowAboutInput(false);
      }, 150);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update about section");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.about) {
      setAboutData(null);
    }
    if (user?.about) {
      setAboutData(user.about);
    }
  }, [user]);
  return (
    <section>
      <h1 className=" text-2xl text-[#222222] dark:text-white font-semibold my-9">About you</h1>
      <div className=" border-[1.3px] border-dashed border-[#b0b0b0] dark:border-[#555555] bg-white dark:bg-[#2a2a2a] py-6 px-4 rounded-xl">
        {aboutData ? (
          <p className=" text-[#717171] dark:text-[#a0a0a0]">{aboutData}</p>
        ) : (
          <p className=" text-[#717171] dark:text-[#a0a0a0]">Write something fun and punchy.</p>
        )}
        {showAboutInput ? (
          <form onSubmit={handleSubmit(handleAboutForm)} className=" mt-4">
            <textarea
              className=" w-full p-3 border-[#b0b0b0] border-[1.3px] rounded-md"
              rows="4"
              autoComplete="off"
              {...register("profileDetailsAbout", { maxLength: 400 })}
              onChange={(event) => {
                setCharacterCount(
                  event.target.value.replace(/\s/g, " ").length
                );
              }}
            ></textarea>
            <div className=" mt-2 mb-3">
              <p
                className={` text-xs font-semibold mt-1 flex flex-row-reverse ${
                  characterCount > 400 ? " text-red-400" : "text-[#717171]"
                }`}
              >
                {characterCount}/400 characters
              </p>
            </div>
            <div className=" flex flex-row-reverse gap-3">
              <button
                className={` px-7 py-3 bg-[#282828] hover:bg-[#000000] text-white rounded-lg font-medium shadow disabled:bg-[#dddddd] ${
                  isLoading || characterCount > 400 ? " cursor-not-allowed" : ""
                }`}
                type="submit"
                disabled={isLoading || characterCount > 400}
              >
                Save
              </button>
              <button
                className="px-7 py-3 border-[1.3px] border-[#222222] dark:border-[#555555] text-black dark:text-white bg-white dark:bg-[#2a2a2a] hover:bg-[#f7f7f7] dark:hover:bg-[#333333] rounded-lg"
                onClick={() => {
                  setShowAboutInput((prev) => !prev);
                }}
              >
                Close
              </button>
            </div>
          </form>
        ) : (
          <p
            className=" text-black dark:text-white font-medium underline mt-1 cursor-pointer"
            onClick={() => {
              setShowAboutInput((prev) => !prev);
            }}
          >
            Add intro
          </p>
        )}
      </div>
    </section>
  );
};

export default UserAbout;
