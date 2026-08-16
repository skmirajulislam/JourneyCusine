import { useEffect, useState } from "react";
import FloorPlanCard from "../../components/listingHouse/FloorPlanCard";
import { useListingFlow } from "../../context/ListingFlowContext";

const ListingHouseStepOneFloorPlan = () => {
  const { newHouse, setNewHouse } = useListingFlow();
  const [guestNumber, setGuestNumber] = useState(newHouse?.floorPlan?.guests || 1);
  const [bedroomsNumber, setBedroomsNumber] = useState(newHouse?.floorPlan?.bedrooms || 1);
  const [bedsNumber, setBedsNumber] = useState(newHouse?.floorPlan?.beds || 1);
  const [bathroomsNumber, setBathroomsNumber] = useState(newHouse?.floorPlan?.bathroomsNumber || 1);

  useEffect(() => {
    let floorPlan = {
      guests: guestNumber,
      bedrooms: bedroomsNumber,
      beds: bedsNumber,
      bathroomsNumber: bathroomsNumber,
    };
    setNewHouse((prev) => ({
      ...prev,
      floorPlan,
    }));
  }, [bathroomsNumber, bedroomsNumber, bedsNumber, guestNumber]);

  return (
    <section className="flex flex-col gap-10 max-w-screen-md mx-auto my-6 min-h-[70dvh] 2xl:h-[80vh]">
      <div className="flex flex-col gap-2">
        <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium">
          Share some basics about your place
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400">
          You&apos;ll add more details later, like bed types
        </p>
      </div>
      <div className="flex flex-col gap-5 mt-5">
        <FloorPlanCard
          name={"Guests"}
          number={guestNumber}
          setNumber={setGuestNumber}
          filter={false}
        />
        <hr className="border-neutral-200 dark:border-neutral-800 my-2" />
        <FloorPlanCard
          name={"Bedrooms"}
          number={bedroomsNumber}
          setNumber={setBedroomsNumber}
          filter={false}
        />
        <hr className="border-neutral-200 dark:border-neutral-800 my-2" />
        <FloorPlanCard
          name={"Beds"}
          number={bedsNumber}
          setNumber={setBedsNumber}
          filter={false}
        />
        <hr className="border-neutral-200 dark:border-neutral-800 my-2" />
        <FloorPlanCard
          name={"Bathrooms"}
          number={bathroomsNumber}
          setNumber={setBathroomsNumber}
          filter={false}
        />
        <hr className="border-neutral-200 dark:border-neutral-800 my-2" />
      </div>
    </section>
  );
};

export default ListingHouseStepOneFloorPlan;
