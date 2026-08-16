import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Payment from "../components/Booking/Payment";
import Listing from "../components/Booking/Listing";
import { FadeLoader } from "react-spinners";
import { useListingDetails } from "../hooks/useHostData";

const Book = () => {
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [searchParams] = useSearchParams();
  const searchParamsObj = Object.fromEntries([...searchParams]);

  const navigate = useNavigate();
  const params = useParams();
  const listingId = params?.id;

  const { data: listingDetailsData, isLoading } = useListingDetails(listingId);
  const listingData = listingDetailsData?.listing;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-[60dvh]">
        <FadeLoader color="#ff385c" />
      </div>
    );
  }

  return (
    <main className="max-w-screen-2xl xl:px-12 mx-auto py-7 xl:py-20">
      <div className="flex flex-row gap-3 items-center px-3 md:px-5 mb-4">
        <div
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#111827] dark:text-white cursor-pointer transition duration-200"
          title="Go back"
        >
          <MdKeyboardArrowLeft size={28} />
        </div>
        <h2 className="text-lg sm:text-xl md:text-[32px] text-[#111827] dark:text-white font-bold text-center">
          Confirm and pay
        </h2>
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-between gap-10 md:gap-8 xl:gap-24 px-3 md:px-5">
        <div className="flex-1">
          <Payment
            searchParamsObj={searchParamsObj}
            appliedCoupon={appliedCoupon}
            listingDataProp={listingData}
          />
        </div>
        <div className="w-full md:w-[380px] lg:w-[440px] shrink-0">
          <Listing
            searchParamsObj={searchParamsObj}
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
            listingDataProp={listingData}
          />
        </div>
      </div>
    </main>
  );
};

export default Book;
