import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import EditProfile from "../../Pages/UserProfile/EditProfile";
import MainLayout from "../../layout/MainLayout";
import UserProfile from "../../Pages/UserProfile/UserProfile";
import Overview from "../../Pages/Dashboard/Overview";
import MotelYourHome from "../../Pages/MotelYourHome";
import Reservations from "../../Pages/Dashboard/Reservations";
import Listing from "../../Pages/Dashboard/Listing";
import ProtectedRoute from "../ProtectedRoute";
import CreateNewListLayout from "../../layout/CreateNewListLayout";
import ListHouseOverview from "../../Pages/ListHouseOverview";
import ListHouseStepOne from "../../Pages/ListingHouseStepOne/ListHouseStepOne";
import ListHouseStepOneStructure from "../../Pages/ListingHouseStepOne/ListHouseStepOneStructure";
import ListHouseStepOnePlacetype from "../../Pages/ListingHouseStepOne/ListHouseStepOnePlacetype";
import { FadeLoader } from "react-spinners";
import ContactUs from "../../Pages/ContactForm";
// import ListingHouseStepOneAddress from "../../Pages/ListingHouseStepOne/ListingHouseStepOneAddress";
// import ListingHouseStepOneFloorPlan from "../../Pages/ListingHouseStepOne/ListingHouseStepOneFloorPlan";
// import StepTwoOverview from "../../Pages/ListingHouseStepTwo/StepTwoOverview";
// import Amenities from "../../Pages/ListingHouseStepTwo/Amenities";
// import ListingHousePhotos from "../../Pages/ListingHouseStepTwo/ListingHousePhotos";
// import HouseTitle from "../../Pages/ListingHouseStepTwo/HouseTitle";
// import Highlight from "../../Pages/ListingHouseStepTwo/Highlight";
// import Description from "../../Pages/ListingHouseStepTwo/Description";
// import FinalStepOverview from "../../Pages/ListingHouseFinalStep/FinalStepOverview";
// import Visibility from "../../Pages/ListingHouseFinalStep/Visibility";
// import Pricing from "../../Pages/ListingHouseFinalStep/Pricing";
// import Legal from "../../Pages/ListingHouseFinalStep/Legal";
// import Receipt from "../../Pages/ListingHouseFinalStep/Receipt";
// import Thankyou from "../../Pages/ListingHouseFinalStep/Thankyou";
// import Home from "../../Pages/Home"; = lazy (() => import)
const ListingHouseStepOneAddress = lazy(() =>
  import("../../Pages/ListingHouseStepOne/ListingHouseStepOneAddress")
);
const ListingHouseStepOneFloorPlan = lazy(() =>
  import("../../Pages/ListingHouseStepOne/ListingHouseStepOneFloorPlan")
);
const StepTwoOverview = lazy(() =>
  import("../../Pages/ListingHouseStepTwo/StepTwoOverview")
);
const Amenities = lazy(() =>
  import("../../Pages/ListingHouseStepTwo/Amenities")
);
const ListingHousePhotos = lazy(() =>
  import("../../Pages/ListingHouseStepTwo/ListingHousePhotos")
);
const HouseTitle = lazy(() =>
  import("../../Pages/ListingHouseStepTwo/HouseTitle")
);
const Highlight = lazy(() =>
  import("../../Pages/ListingHouseStepTwo/Highlight")
);
const Home = lazy(() => import("../../Pages/Home"));
const ListingDetails = lazy(() => import("../../Pages/ListingDetails"));
const Wishlist = lazy(() => import("../../Pages/Wishlist"));
const Trips = lazy(() => import("../../Pages/Trips"));
// import Book from "../../Pages/Book";
const Book = lazy(() => import("../../Pages/Book"));
const PaymentConfirmed = lazy(() => import("../../Pages/PaymentConfirmed"));
const Thankyou = lazy(() =>
  import("../../Pages/ListingHouseFinalStep/Thankyou")
);
const Receipt = lazy(() => import("../../Pages/ListingHouseFinalStep/Receipt"));
const Legal = lazy(() => import("../../Pages/ListingHouseFinalStep/Legal"));
const Pricing = lazy(() => import("../../Pages/ListingHouseFinalStep/Pricing"));
const Visibility = lazy(() =>
  import("../../Pages/ListingHouseFinalStep/Visibility")
);
const FinalStepOverview = lazy(() =>
  import("../../Pages/ListingHouseFinalStep/FinalStepOverview")
);
const Description = lazy(() =>
  import("../../Pages/ListingHouseStepTwo/Description")
);
const Terms = lazy(() => import("../../Pages/Terms"));
const Privacy = lazy(() => import("../../Pages/Privacy"));
const NotFound = lazy(() => import("../../Pages/NotFound"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/rooms/:id",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <ListingDetails />
          </Suspense>
        ),
      },
      {
        path: "/house/:id",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <ListingDetails />
          </Suspense>
        ),
      },
      {
        path: "/book/stays/:id",
        element: (
          <ProtectedRoute>
            <Suspense
              fallback={
                <div className=" flex justify-center items-center w-full h-[60dvh]">
                  <FadeLoader color="#000" />
                </div>
              }
            >
              <Book />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/show/:id",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/profile",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/profile",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-bookings",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/show/:id/editMode=true",
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/dashboard/:id/overview=true",
        element: (
          <ProtectedRoute>
            <Overview />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/dashboard/:id/reservations",
        element: (
          <ProtectedRoute>
            <Reservations />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/dashboard/:id/listing=true",
        element: (
          <ProtectedRoute>
            <Listing />
          </ProtectedRoute>
        ),
      },
      {
        path: "/host/homes",
        element: (
          <ProtectedRoute>
            <MotelYourHome />
          </ProtectedRoute>
        ),
      },
      {
        path: "/wishlists",
        element: (
          <ProtectedRoute>
            <Suspense
              fallback={
                <div className=" flex justify-center items-center w-full h-[60dvh]">
                  <FadeLoader color="#ff385c" />
                </div>
              }
            >
              <Wishlist />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/trips",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#ff385c" />
              </div>
            }
          >
            <Trips />
          </Suspense>
        ),
      },
      {
        path: "/trips/join/:inviteCode",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#ff385c" />
              </div>
            }
          >
            <Trips />
          </Suspense>
        ),
      },
      {
        path: "/contact",
        element: <ContactUs />,
      },
      {
        path: "/terms",
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#ff385c" />
              </div>
            }
          >
            <Terms />
          </Suspense>
        ),
      },
      {
        path: "/privacy",
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#ff385c" />
              </div>
            }
          >
            <Privacy />
          </Suspense>
        ),
      },
      {
        path: "/payment-confirmed",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <PaymentConfirmed />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#ff385c" />
              </div>
            }
          >
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/become-a-host",
    element: (
      <ProtectedRoute>
        <CreateNewListLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/become-a-host",
        element: <ListHouseOverview />,
      },
      {
        path: "/become-a-host/:id/about-your-place",
        element: <ListHouseStepOne />,
      },
      {
        path: "/become-a-host/:id/structure",
        element: <ListHouseStepOneStructure />,
      },
      {
        path: "/become-a-host/:id/privacy-type",
        element: <ListHouseStepOnePlacetype />,
      },
      {
        path: "/become-a-host/:id/location",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <ListingHouseStepOneAddress />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/floor-plan",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <ListingHouseStepOneFloorPlan />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/stand-out",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <StepTwoOverview />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/amenities",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Amenities />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/photos",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <ListingHousePhotos />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/title",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <HouseTitle />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/highlight",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Highlight />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/description",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Description />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/finish-step",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <FinalStepOverview />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/visiblity",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Visibility />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/price",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Pricing />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/legal",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Legal />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/receipt",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Receipt />
          </Suspense>
        ),
      },
      {
        path: "/become-a-host/:id/published",
        element: (
          <Suspense
            fallback={
              <div className=" flex justify-center items-center w-full h-[60dvh]">
                <FadeLoader color="#000" />
              </div>
            }
          >
            <Thankyou />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
