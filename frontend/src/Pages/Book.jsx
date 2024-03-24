import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Payment from "../components/Booking/Payment";
import Listing from "../components/Booking/Listing";
import { API } from "../backend";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { FadeLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { getOneListingRoomsDetails } from "../redux/actions/houseActions";

const Book = () => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams] = useSearchParams();

  //   making the search params in an obj and store in a vairable
  const searchParamsObj = Object.fromEntries([...searchParams]);

  const navigate = useNavigate();

  const params = useParams();
  const listingId = params?.id;

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(getOneListingRoomsDetails(listingId));
      setIsLoading(false);
    })();
  }, [listingId, dispatch, setIsLoading]);

  // stripe provider for elements component like paymaent component
  useEffect(() => {
    fetch(`${API}reservations/config`).then(async (r) => {
      const { publishableKey } = await r.json();
      setStripePromise(loadStripe(publishableKey));
    });
  }, []);

  useEffect(() => {
    // making payment calls
    fetch(`${API}reservations/create_payment_intent`, {
      method: "POST",
      body: JSON.stringify({}),
    }).then(async (r) => {
      const { clientSecret } = await r.json();
      setClientSecret(clientSecret);
    }).catch((err)=>{
      alert(err)
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading) {
    return (
      <div className=" flex justify-center items-center w-full h-[60dvh]">
        <FadeLoader color="#000" />
      </div>
    );
  }

  return (
    <main className=" max-w-screen-2xl xl:px-12 mx-auto py-7 xl:py-20">
      {stripePromise && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <div className=" flex flex-row gap-3 items-center px-3 md:px-5">
            <div
              onClick={() => {
                navigate(-1);
              }}
              className=" p-2 rounded-full hover:bg-[#f1f1f1] cursor-pointer transition duration-200 ease-in"
            >
              <MdKeyboardArrowLeft size={28} />
            </div>
            <h2 className="text-lg sm:text-xl md:text-[32px] text-[#222222] font-medium text-center">
              Confirm and pay
            </h2>
          </div>
          {/* reservations data */}
          <section className=" grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 pt-10 px-8 md:px-10">
            {/* left side data => reservations data */}
            <div className="order-2 md:order-1">
              <Payment searchParamsObj={searchParamsObj} />
            </div>
            {/* right side data => listing details */}
            <div className="order-1 md:order-2">
              <Listing searchParamsObj={searchParamsObj} />
            </div>
          </section>
        </Elements>
      )}
    </main>
  );
};

export default Book;
