const Thankyou = () => {
  return (
    <div className=" flex flex-col gap-10 max-w-screen-md mx-auto my-6 sm:min-h-[30vh] justify-center">
      <div className=" flex flex-col justify-center sm:w-[80%] mx-auto">
        <h1 className=" text-[#222222] text-2xl sm:text-3xl md:text-[32px] font-medium">
          Thank you for hosting your houses.
        </h1>
        <p className="text-base sm:text-lg text-[#717171] py-2 sm:py-0">
          Now you can see your listed house on the listing page in the
          dashboard.
        </p>
      </div>
    </div>
  );
};

export default Thankyou;
