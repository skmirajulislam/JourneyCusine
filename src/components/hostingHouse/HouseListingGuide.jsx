import bgImage from "../../assets/setupPic.png";
import SetupCard from "./SetupCard";

const HouseListingGuide = () => {
  return (
    <section className=" my-8 md:my-20 flex flex-col gap-10">
      <h1 className=" text-2xl md:text-4xl text-[#222222] font-medium text-center">
        Motel it easily with Motel Setup
      </h1>
      <>
        <img src={bgImage} alt="background" />
      </>
      <div className=" grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SetupCard
          heading={"One-to-one guidance from a Superhost"}
          subHeading={
            "We’ll match you with a Superhost in your area, who’ll guide you from your first question to your first guest—by phone, video call, or chat."
          }
        />
        <SetupCard
          heading={"An experienced guest for your first booking"}
          subHeading={
            "For your first booking, you can choose to welcome an experienced guest who has at least three stays and a good track record on Motel."
          }
        />
        <SetupCard
          heading={"Specialized support from Motel"}
          subHeading={
            "New Hosts get one-tap access to specially trained Community Support agents who can help with everything from account issues to billing support."
          }
        />
      </div>
    </section>
  );
};

export default HouseListingGuide;
