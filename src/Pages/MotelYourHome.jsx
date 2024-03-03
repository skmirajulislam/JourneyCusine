import { useState } from "react";
import Map from "../components/Map";
import HouseHostingDetails from "../components/hostingHouse/HouseHostingDetails";
import HouseListingGuide from "../components/hostingHouse/HouseListingGuide";
import Apartments from "../components/hostingHouse/Apartments";
import Faq from "../components/hostingHouse/Faq";

const MotelYourHome = () => {
  const [latAndLong, setLatAndLong] = useState([]);
  return (
    <main className=" mt-8 md:mt-20 xl:px-20 xl:mx-auto max-w-screen-xl px-8 md:px-12">
      <section className=" grid grid-cols-1 lg:grid-cols-2 gap-7 pb-10 items-center">
        <HouseHostingDetails setLatAndLong={setLatAndLong} />
        {/* map section */}
        <div className=" w-full h-[300px] md:h-[400px] lg:h-[450px] mx-auto">
          <Map latAndLong={latAndLong} key="motelMap" />
        </div>
      </section>
      {/* setup guidelines */}
      <HouseListingGuide />
      <Apartments />
      <Faq />
    </main>
  );
};

export default MotelYourHome;
