import step1 from "../../assets/video/step1_video.mp4";

const ListHouseStepOne = () => {
  return (
    <section className=" h-[80vh] flex flex-col lg:flex-row justify-around gap-5 lg:gap-10 items-center w-full my-8 sm:my-12 md:my-16 lg:my-0">
      <div className="flex flex-col gap-2 md:gap-4 text-[#222222] sm:px-5 md:px-8 lg:px-10">
        <div className=" flex flex-col gap-2 font-medium min-h-[130px]">
          <p className=" text-base md:text-lg">Step 1</p>
          <h2 className=" text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Tell us about your place
          </h2>
        </div>
        <p className=" text-xs sm:text-sm md:text-base lg:text-lg">
          In this step, we&apos;ll ask you which type of property you have and
          if guests will book the entire place or just a room. Then let us know
          the location and how many guests can stay.
        </p>
      </div>
      <video
        src={step1}
        autoPlay={true}
        muted
        type="video/mp4"
        className=" max-w-xs sm:max-w-md"
      />
    </section>
  );
};

export default ListHouseStepOne;
