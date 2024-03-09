import video from "../../assets/video/step_3.mp4";

const FinalStepOverview = () => {
  return (
    <section className=" h-[80vh] flex flex-col lg:flex-row justify-evenly gap-5 lg:gap-10 items-center w-full my-8 sm:my-12 md:my-16 lg:my-0">
      <div className="flex flex-col gap-2 md:gap-4 text-[#222222] sm:px-5 md:px-8 lg:px-10">
        <div className=" flex flex-col gap-2 font-medium min-h-[100px]">
          <p className=" text-base md:text-lg mb-2">Step 3</p>
          <h2 className=" text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Finish up and publish
          </h2>
        </div>
        <p className=" text-xs sm:text-sm md:text-base lg:text-lg">
          Finally, you’ll choose if you&apos;d like to start with an experienced
          guest, then you&apos;ll set your nightly price. Answer a few quick
          questions and publish when you&apos;re ready.
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

export default FinalStepOverview;
