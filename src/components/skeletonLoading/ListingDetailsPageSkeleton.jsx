const ListingDetailsPageSkeleton = () => {
  return (
    <div className="max-w-screen-xl xl:px-12 mx-auto py-7 animate-pulse">
      <div className=" flex flex-col gap-7">
        <div className=" flex flex-col gap-2">
          {/* text */}
          <div className=" h-8 w-1/2 bg-[#dddddd]"></div>
          <div className=" grid grid-cols-5 items-center justify-end">
            <div className=" flex flex-row items-center gap-2 col-span-4">
              <div className=" h-5 w-1/2 bg-[#dddddd]"></div>
            </div>
            <div className="col-span-1 flex justify-end ">
              <div className="h-5 w-1/2 bg-[#dddddd]"></div>
            </div>
          </div>
        </div>
        {/* images */}
        <div className=" grid grid-cols-3 gap-2 max-h-[400px] min-h-[300px] rounded-2xl">
          <div className=" rounded-tl-2xl rounded-bl-2xl col-span-2 w-full h-full bg-[#dddddd]"></div>
          <div className="grid grid-rows-2 gap-y-2 max-h-[400px] min-h-[300px] col-span-1">
            <div className="w-full h-full bg-[#dddddd] rounded-tr-2xl"></div>
            <div className="w-full h-full bg-[#dddddd] rounded-br-2xl"></div>
          </div>
        </div>
        {/* details */}
      </div>
    </div>
  );
};

export default ListingDetailsPageSkeleton;
