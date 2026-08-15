import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
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
  const [paymentError, setPaymentError] = useState(null);

  const [searchParams] = useSearchParams();
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

  // Load publishable key from backend
  useEffect(() => {
    fetch(`${API}reservations/config`)
      .then(async (r) => {
        const data = await r.json();
        if (data?.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        } else {
          setPaymentError("Stripe publishable key is missing from server configuration.");
        }
      })
      .catch((err) => {
        console.error("Stripe config error:", err);
        setPaymentError("Failed to connect to payment service.");
      });
  }, []);

  // Initialize PaymentIntent
  const initPaymentIntent = () => {
    setPaymentError(null);
    fetch(`${API}reservations/create_payment_intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId,
        nightStaying: searchParamsObj?.nightStaying || 1,
        guestNumber: searchParamsObj?.numberOfGuests || 1,
      }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          const errMsg = data?.error?.message || "Failed to initialize payment gateway.";
          setPaymentError(errMsg);
        }
      })
      .catch((err) => {
        console.error("Create payment intent error:", err);
        setPaymentError(err.message || "Network error while initializing payment.");
      });
  };

  useEffect(() => {
    initPaymentIntent();
  }, [listingId, searchParamsObj?.nightStaying, searchParamsObj?.numberOfGuests]);

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

      {paymentError ? (
        <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 shadow-xl text-center flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#ff385c]">
            <FiAlertTriangle size={36} />
          </div>
          <h3 className="text-xl font-bold text-[#111827] dark:text-white">
            Stripe Payment Gateway Notice
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-md">
            {paymentError.includes("Expired API Key")
              ? "Your Stripe Test Secret Key in the backend has expired. Please update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in backend/.env with active keys from your Stripe Dashboard."
              : paymentError}
          </p>
          <button
            type="button"
            onClick={initPaymentIntent}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer mt-2"
          >
            <FiRefreshCw size={16} /> Retry Payment Initialization
          </button>
        </div>
      ) : stripePromise && clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          {/* reservations data */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 pt-6 px-4 md:px-10">
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
      ) : (
        <div className="flex flex-col justify-center items-center w-full h-[40dvh] gap-3">
          <FadeLoader color="#ff385c" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-4">
            Initializing secure checkout...
          </p>
        </div>
      )}
    </main>
  );
};

export default Book;
