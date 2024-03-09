import SkeletonLoading from "./SkeletonLoading";

const SkeletonLoadingCards = () => {
  // Determine the number of cards to render based on device size
  const cardCount = window.innerWidth >= 1536 ? 30 : 20;

  // Create an array of card elements
  const cards = Array.from({ length: cardCount }, (_, index) => (
    <SkeletonLoading key={index} />
  ));

  return (
    <div className=" py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mx-auto gap-5 max-w-screen-2xl">
      {/* <SkeletonLoading /> */}
      {cards}
    </div>
  );
};

export default SkeletonLoadingCards;
