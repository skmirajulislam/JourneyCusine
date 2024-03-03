import FaqOptions from "./FaqOptions";

const Faq = () => {
  return (
    <section className=" my-12 sm:py-16 md:my-24 bg-[#f7f7f7] px-6 py-8 md:px-12 lg:px-20 md:py-16 grid grid-cols-1 md:grid-cols-2 justify-between gap-5 md:gap-10 rounded-2xl">
      <h1 className=" text-[#222222] text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-medium">
        Your questions, <br /> answered
      </h1>
      <div>
        <FaqOptions />
      </div>
    </section>
  );
};

export default Faq;
