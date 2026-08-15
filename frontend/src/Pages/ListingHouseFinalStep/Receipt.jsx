import PreviewCard from "../../components/listingHouse/PreviewCard";
import PreviewCardsDescription from "../../components/listingHouse/PreviewCardsDescription";
import SuccessPupup from "../../components/popUp/houseListing/SuccessPupup";

const Reciept = () => {
  return (
    <div className="flex flex-col gap-10 max-w-[900px] mx-auto my-6 min-h-[70vh]">
      <div>
        <h1 className="text-[#111827] dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          Review your listing
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400 mt-3">
          Here&apos;s what we&apos;ll show to guests. Make sure everything looks
          good.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 mx-auto lg:mx-0 w-full">
        {/* preview Card */}
        <PreviewCard />
        {/* card details */}
        <PreviewCardsDescription />
      </div>
      <SuccessPupup />
    </div>
  );
};

export default Reciept;
