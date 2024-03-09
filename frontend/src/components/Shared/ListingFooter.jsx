import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userRole } from "../../redux/actions/userActions";
import { PulseLoader } from "react-spinners";
import {
  getHouseDetails,
  publishListing,
  saveAmenities,
  saveDescription,
  saveFloorPlan,
  saveGuestType,
  saveHighlight,
  saveLocation,
  savePhotos,
  savePrices,
  savePrivacyType,
  saveSecurity,
  saveStructure,
  saveTitle,
} from "../../redux/actions/houseActions";

const ListingFooter = () => {
  const user = useSelector((state) => state.user.userDetails);
  const createHouseData = useSelector((state) => state.house);
  const [loading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const url = window.location.pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentHouseId = localStorage.getItem("currentHouseId");

  console.log(createHouseData);

  useEffect(() => {
    dispatch(getHouseDetails(currentHouseId));
  }, [currentHouseId, dispatch]);

  /**
   * The function `handleNext` navigates to different URLs based on the current URL.
   */

  const steps = [
    "/become-a-host",
    `/become-a-host/${user?._id}/about-your-place`,
    `/become-a-host/${user?._id}/structure`,
    `/become-a-host/${user?._id}/privacy-type`,
    `/become-a-host/${user?._id}/location`,
    `/become-a-host/${user?._id}/floor-plan`,
    `/become-a-host/${user?._id}/stand-out`,
    `/become-a-host/${user?._id}/amenities`,
    `/become-a-host/${user?._id}/photos`,
    `/become-a-host/${user?._id}/title`,
    `/become-a-host/${user?._id}/highlight`,
    `/become-a-host/${user?._id}/description`,
    `/become-a-host/${user?._id}/finish-step`,
    `/become-a-host/${user?._id}/visiblity`,
    `/become-a-host/${user?._id}/price`,
    `/become-a-host/${user?._id}/legal`,
    `/become-a-host/${user?._id}/receipt`,
    `/become-a-host/${user?._id}/published`,
  ];

  const currentStepIndex = steps.indexOf(url);
  const currentListingHouseId = localStorage.getItem("currentHouseId");
  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      setIsLoading(true);

      if (currentStepIndex === 0) {
        // Handle any actions specific to the user role
        await dispatch(userRole());
      } else if (currentStepIndex === 2) {
        const houseData = {
          houseType: createHouseData?.newHouse?.houseType,
          houseId: currentListingHouseId,
        };
        // Handle data saving for the "structure" step
        await dispatch(saveStructure(houseData));
      } else if (currentStepIndex === 3) {
        const houseData = {
          privacyType: createHouseData?.newHouse?.privacyType,
          houseId: currentListingHouseId,
        };
        // data saving for privacy type in db
        await dispatch(savePrivacyType(houseData));
      } else if (currentStepIndex === 4) {
        const locationData = {
          location: createHouseData?.newHouse?.location,
          houseId: currentListingHouseId,
        };
        // data saving for location in db
        await dispatch(saveLocation(locationData));
      } else if (currentStepIndex === 5) {
        const floorPlanData = {
          floorPlan: createHouseData?.newHouse?.floorPlan,
          houseId: currentListingHouseId,
        };
        // data saving for floor plan in db
        await dispatch(saveFloorPlan(floorPlanData));
      } else if (currentStepIndex === 7) {
        const amenitiesData = {
          amenities: createHouseData?.newHouse?.amenities,
          houseId: currentListingHouseId,
        };
        // data saving for amenites plan in db
        await dispatch(saveAmenities(amenitiesData));
      } else if (currentStepIndex === 8) {
        const photosData = {
          photos: createHouseData?.newHouse?.photos,
          houseId: currentListingHouseId,
        };
        // data saving for photos in db
        await dispatch(savePhotos(photosData));
      } else if (currentStepIndex === 9) {
        const titleData = {
          title: createHouseData?.newHouse?.title,
          houseId: currentListingHouseId,
        };
        // data save title to db
        await dispatch(saveTitle(titleData));
      } else if (currentStepIndex === 10) {
        const highlightData = {
          highlight: createHouseData?.newHouse?.highlights,
          houseId: currentListingHouseId,
        };
        // data save title to db
        await dispatch(saveHighlight(highlightData));
      } else if (currentStepIndex === 11) {
        const descriptionData = {
          description: createHouseData?.newHouse?.description,
          houseId: currentListingHouseId,
        };
        // data save title to db
        await dispatch(saveDescription(descriptionData));
      } else if (currentStepIndex === 13) {
        const visibilityData = {
          guestType: createHouseData?.newHouse?.guestType,
          houseId: currentListingHouseId,
        };
        // data save title to db
        await dispatch(saveGuestType(visibilityData));
      } else if (currentStepIndex === 14) {
        const PriceData = {
          priceBeforeTaxes: createHouseData?.newHouse?.priceBeforeTaxes,
          authorEarnedPrice: createHouseData?.newHouse?.authorEarnedPrice,
          basePrice: createHouseData?.newHouse?.basePrice,
          houseId: currentListingHouseId,
        };
        // data save title to db
        await dispatch(savePrices(PriceData));
      } else if (currentStepIndex === 15) {
        const securityData = {
          security: createHouseData?.newHouse?.security,
          houseId: currentListingHouseId,
        };
        // data save title to db
        await dispatch(saveSecurity(securityData));
      } else if (currentStepIndex === 16) {
        const publishList = {
          houseId: currentListingHouseId,
        };
        // data save title to db
        await dispatch(publishListing(publishList));
      }

      setIsLoading(false);

      // Navigate to the next step
      navigate(steps[currentStepIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // // show modal on last page
    // window.thankyou_modal.showModal();
  };
  /* The `useEffect` hook in the code snippet is used to update the `progress` state based on the current
URL. */
  useEffect(() => {
    if (url?.includes("/about-your-place")) {
      setProgress(0);
    }
    if (url?.includes("/structure")) {
      setProgress(10);
    }
    if (url?.includes("/privacy-type")) {
      setProgress(20);
    }
    if (url?.includes("/location")) {
      setProgress(25);
    }
    if (url?.includes("/floor-plan")) {
      setProgress(30);
    }
    if (url?.includes("/stand-out")) {
      setProgress(35);
    }
    if (url?.includes("/amenities")) {
      setProgress(40);
    }
    if (url?.includes("/photos")) {
      setProgress(50);
    }
    if (url?.includes("/title")) {
      setProgress(60);
    }
    if (url?.includes("/highlight")) {
      setProgress(65);
    }
    if (url?.includes("/description")) {
      setProgress(70);
    }
    if (url?.includes("/finish-step")) {
      setProgress(75);
    }
    if (url?.includes("/visibility")) {
      setProgress(80);
    }
    if (url?.includes("/price")) {
      setProgress(85);
    }
    if (url?.includes("/legal")) {
      setProgress(90);
    }
    if (url?.includes("/receipt")) {
      setProgress(95);
    }
  }, [progress, url]);

  return (
    <footer className=" sticky bottom-0 bg-white">
      {/* progressbar */}
      {!url.includes("/published") && (
        <div>
          <progress
            className="progress w-full shadow-sm transition-all duration-700"
            value={progress}
            max="100"
          ></progress>
        </div>
      )}

      {/* button */}
      <div className=" flex justify-between py-4 px-6 sm:px-10 md:px-20 top-0 z-10 bg-white max-w-screen-xl xl:px-20 xl:mx-auto">
        {/* if in the success/last page don't show the back button */}
        {!url.includes("/published") ? (
          <button
            className=" hover:bg-[#f1f1f1] text-black rounded-md px-4 py-2 underline"
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </button>
        ) : (
          <div> </div>
        )}

        {url.includes("/published") ? (
          <a
            href={`/users/dashboard/${user?._id}/listing=true`}
            className="text-lg text-white font-medium rounded-md px-9 py-3 disabled:bg-[#dddddd] disabled:cursor-not-allowed transition durtion-300 ease-in bg-[#222222] hover:bg-black"
          >
            See listing
          </a>
        ) : (
          <>
            {/* on publish page showing a colored button */}
            <button
              className={`text-lg text-white font-medium rounded-md px-9 py-3 disabled:bg-[#dddddd] disabled:cursor-not-allowed transition durtion-300 ease-in ${
                url?.includes("/receipt")
                  ? "bg-[#ff385c] hover:bg-[#d90b63]"
                  : "bg-[#222222] hover:bg-black"
              }`}
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <PulseLoader
                    color="#f7f7f7"
                    size={7}
                    margin={4}
                    speedMultiplier={0.6}
                  />
                </>
              ) : (
                <>{url?.includes("/receipt") ? "Publish" : "Next"}</>
              )}
            </button>
          </>
        )}
      </div>
    </footer>
  );
};

export default ListingFooter;
