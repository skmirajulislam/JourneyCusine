import SetupCard from "./SetupCard";

import apartment1 from "../../assets/apartments1.png";
import apartment2 from "../../assets/apartments2.png";
import apartment3 from "../../assets/apartments3.png";

const Apartments = () => {
  return (
    <section className="my-12 sm:my-16 md:my-24">
      <h1 className=" text-2xl md:text-4xl text-[#222222] font-medium text-center">
        Introducing Motel-friendly apartments
      </h1>
      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
        <SetupCard
          img={apartment1}
          heading={"Park 12 Apartments"}
          subHeading={"San Diego, California"}
        />
        <SetupCard
          img={apartment2}
          heading={"Old Town Apartments"}
          subHeading={"Scottsdale, Arizona"}
        />
        <SetupCard
          img={apartment3}
          heading={"525 Olive Apartments"}
          subHeading={"San Diego, California"}
        />
      </div>
      <h6 className="text-base sm:text-lg md:text-xl text-center text-[#222222] sm:w-[80%] mx-auto">
        We’ve partnered with apartment buildings across the US that let you rent
        a place to live and Motel it part-time. Explore available apartments and
        find out what you can earn.
      </h6>
    </section>
  );
};

export default Apartments;
