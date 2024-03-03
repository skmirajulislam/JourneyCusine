import SkeletonLoading from "./SkeletonLoading";

const HomePageSkeleton = () => {
  // Determine the number of cards to render based on device size
  const cardCount = window.innerWidth >= 1536 ? 30 : 20;

  // Create an array of card elements
  const cards = Array.from({ length: cardCount }, (_, index) => (
    <SkeletonLoading key={index} />
  ));
  return (
    <>
      <div className="max-w-screen-2xl xl:px-10 items-center gap-4 mb-10 pt-6 grid grid-cols-12 mx-auto">
        <div className=" col-span-9 lg:flex flex-row justify-around animate-pulse hidden">
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"></div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
          <div className=" bg-[#dddddd] rounded-full w-11 h-11"> </div>
        </div>
        <div className="border-[#dddddd] border rounded-xl h-14 flex justify-around items-center col-span-3 animate-pulse">
          <div className="h-3 w-3/5 rounded-lg bg-[#dddddd]"> </div>
          <div className=" w-[40px] rounded-full bg-[#dddddd] h-6"></div>
        </div>
      </div>
      <div className=" pb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-auto gap-5 max-w-screen-2xl xl:px-10">
        {/* <SkeletonLoading /> */}
        {cards}
      </div>
    </>
  );
};

export default HomePageSkeleton;
