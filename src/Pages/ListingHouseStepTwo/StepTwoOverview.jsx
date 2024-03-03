import video from "../../assets/video/step_2.mp4";

const StepTwoOverview = () => {
  return (
    <section className=" h-[70vh] md:h-[80vh] flex flex-col lg:flex-row gap-5 lg:gap-10 items-center w-full my-8 sm:my-12 md:my-16 lg:my-0">
      <div className="flex flex-col gap-2 md:gap-4 text-[#222222] sm:px-5 md:px-8 lg:px-10">
        <div className=" flex flex-col gap-2 font-medium">
          <p className="text-base md:text-lg">Step 2</p>
          <h2 className=" text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Make your place stand out
          </h2>
        </div>
        <p className=" text-xs sm:text-sm md:text-base lg:text-lg">
          In this step, you’ll add some of the amenities your place offers, plus
          5 or more photos. Then, you’ll create a title and description.
        </p>
      </div>
      <video
        src={video}
        autoPlay={true}
        muted
        type="video/mp4"
        className=" max-w-xs sm:max-w-md"
      />
    </section>
  );
};

export default StepTwoOverview;
