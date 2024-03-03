import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../../backend";

const UserAbout = () => {
  const [showAboutInput, setShowAboutInput] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aboutData, setAboutData] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const user = useSelector((state) => state.user?.userDetails?.profileDetails);

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
      console.log(postUserAboutData);
      if (postUserAboutData.status === 200) {
        toast.success(postUserAboutData.data.message);
      }
      setTimeout(() => {
        reset();
        setShowAboutInput(false);
      }, 150);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
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
      <h1 className=" text-2xl text-[#222222] font-semibold my-9">About you</h1>
      <div className=" border-[1.3px] border-dashed border-[#b0b0b0] bg-white py-6 px-4 rounded-xl">
        {aboutData ? (
          <p className=" text-[#717171]">{aboutData}</p>
        ) : (
          <p className=" text-[#717171]">Write something fun and punchy.</p>
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
                className="px-7 py-3 border-[1.3px] border-[#222222] text-black bg-white hover:bg-[#f7f7f7] rounded-lg"
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
            className=" text-black font-medium underline mt-1 cursor-pointer"
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
