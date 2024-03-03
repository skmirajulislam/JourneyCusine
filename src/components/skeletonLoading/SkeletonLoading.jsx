const SkeletonLoading = () => {
  return (
    <>
      <div className="space-y-5 rounded-2xl bg-white w-[320px] md:w-[280px] animate-pulse">
        <div className="h-64 rounded-xl bg-[#dddddd]"></div>
        <div className="space-y-3">
          <div className="h-3 w-3/5 rounded-lg bg-[#dddddd]"></div>
          <div className="h-3 w-4/5 rounded-lg bg-[#dddddd]"></div>
          <div className="h-3 w-2/5 rounded-lg bg-[#dddddd]"></div>
        </div>
      </div>
    </>
  );
};

export default SkeletonLoading;
