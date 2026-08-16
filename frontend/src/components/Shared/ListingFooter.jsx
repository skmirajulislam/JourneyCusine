import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import api from "../../backend";
import { useAuth } from "../../hooks/useAuth";
import { useListingFlow } from "../../context/ListingFlowContext";

const ListingFooter = () => {
  const { user } = useAuth();
  const {
    newHouse,
    currentListingHouse,
    getHouseDetails,
    saveStructure,
    savePrivacyType,
    saveLocation,
    saveFloorPlan,
    saveAmenities,
    savePhotos,
    saveHouseTitle,
    saveHouseHighlights,
    saveHouseDescription,
    saveHousePrices,
    saveSecurity,
    publishListing,
  } = useListingFlow();

  const [loading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const url = window.location.pathname;
  const navigate = useNavigate();
  const currentHouseId = localStorage.getItem("currentHouseId");

  useEffect(() => {
    if (currentHouseId) {
      getHouseDetails(currentHouseId);
    }
  }, [currentHouseId]);

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

  const validateCurrentStep = () => {
    // 1. Validate Location / Address (Step 4)
    if (url.includes("/location")) {
      const loc = newHouse?.location || currentListingHouse?.location;
      const countryName = loc?.country?.name || loc?.country;
      const cityName = loc?.city?.name || loc?.city;
      const address = loc?.addressLineOne?.trim();

      if (!countryName || !cityName || !address) {
        toast.error("Please enter your country, city, and address line 1 to proceed.", {
          id: "host-validation",
        });
        return false;
      }
    }

    // 2. Validate Photos / Image Upload (Step 8)
    if (url.includes("/photos")) {
      const photos = newHouse?.photos || currentListingHouse?.photos;
      if (!Array.isArray(photos) || photos.length === 0) {
        toast.error("Please upload at least one image of your stay to proceed.", {
          id: "host-validation",
        });
        return false;
      }
    }

    // 3. Validate Title (Step 9)
    if (url.includes("/title")) {
      const title = newHouse?.title || currentListingHouse?.title;
      if (!title || title.trim().length < 3) {
        toast.error("Please provide a title (at least 3 characters) for your stay.", {
          id: "host-validation",
        });
        return false;
      }
    }

    // 4. Validate Description (Step 11)
    if (url.includes("/description")) {
      const desc = newHouse?.description || currentListingHouse?.description;
      if (!desc || desc.trim().length < 10) {
        toast.error(
          "Please write a description (at least 10 characters) for your stay.",
          { id: "host-validation" }
        );
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setIsLoading(true);

      try {
        if (currentStepIndex === 0) {
          const response = await api.post("/auth/become_a_host", { role: "host" });
          const newId = response.data?.house?._id;
          if (newId) {
            localStorage.setItem("currentHouseId", newId);
          }
        } else if (currentStepIndex === 2) {
          const houseData = {
            houseType: newHouse?.houseType,
            houseId: currentListingHouseId,
          };
          await saveStructure(houseData);
        } else if (currentStepIndex === 3) {
          const houseData = {
            privacyType: newHouse?.privacyType,
            houseId: currentListingHouseId,
          };
          await savePrivacyType(houseData);
        } else if (currentStepIndex === 4) {
          const locationData = {
            location: newHouse?.location,
            houseId: currentListingHouseId,
          };
          await saveLocation(locationData);
        } else if (currentStepIndex === 5) {
          const floorPlanData = {
            floorPlan: newHouse?.floorPlan,
            houseId: currentListingHouseId,
          };
          await saveFloorPlan(floorPlanData);
        } else if (currentStepIndex === 7) {
          const amenitiesData = {
            amenities: newHouse?.amenities,
            houseId: currentListingHouseId,
          };
          await saveAmenities(amenitiesData);
        } else if (currentStepIndex === 8) {
          const photosData = {
            photos: newHouse?.photos,
            houseId: currentListingHouseId,
          };
          await savePhotos(photosData);
        } else if (currentStepIndex === 9) {
          const titleData = {
            title: newHouse?.title,
            houseId: currentListingHouseId,
          };
          await saveHouseTitle(titleData);
        } else if (currentStepIndex === 10) {
          const highlightData = {
            highlight: newHouse?.highlights,
            houseId: currentListingHouseId,
          };
          await saveHouseHighlights(highlightData);
        } else if (currentStepIndex === 11) {
          const descriptionData = {
            description: newHouse?.description,
            houseId: currentListingHouseId,
          };
          await saveHouseDescription(descriptionData);
        } else if (currentStepIndex === 13) {
          const visibilityData = {
            guestType: newHouse?.guestType,
            houseId: currentListingHouseId,
          };
          await api.post("/house/save_guest_type", visibilityData, {
            headers: { "Content-Type": "application/json" },
          });
        } else if (currentStepIndex === 14) {
          const PriceData = {
            priceBeforeTaxes: newHouse?.priceBeforeTaxes,
            authorEarnedPrice: newHouse?.authorEarnedPrice,
            basePrice: newHouse?.basePrice,
            houseId: currentListingHouseId,
          };
          await saveHousePrices(PriceData);
        } else if (currentStepIndex === 15) {
          const securityData = {
            security: newHouse?.security,
            houseId: currentListingHouseId,
          };
          await saveSecurity(securityData);
        } else if (currentStepIndex === 16) {
          const publishList = {
            houseId: currentListingHouseId,
          };
          await publishListing(publishList);
        }

        navigate(steps[currentStepIndex + 1]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Save step error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

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
    <footer className="w-full sticky bottom-0 bg-white dark:bg-[#121212] border-t border-neutral-200 dark:border-neutral-800 z-30 transition-colors">
      {/* progressbar */}
      {!url.includes("/published") && (
        <div className="w-full">
          <progress
            className="progress w-full transition-all duration-700 block"
            value={progress}
            max="100"
          ></progress>
        </div>
      )}

      {/* button container */}
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-8 md:px-10 xl:px-20 py-4 flex justify-between items-center bg-transparent">
        {!url.includes("/published") ? (
          <button
            className="hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#111827] dark:text-white rounded-xl px-5 py-2.5 font-bold text-sm underline transition-all cursor-pointer"
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
            className="text-sm font-bold text-white dark:text-[#111827] rounded-xl px-8 py-3 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all duration-200 bg-[#111827] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 shadow-md"
          >
            See listing
          </a>
        ) : (
          <button
            className={`text-sm font-bold text-white rounded-xl px-8 py-3 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed transition-all duration-200 shadow-md cursor-pointer ${
              url?.includes("/receipt")
                ? "bg-[#ff385c] hover:bg-[#d90b63] text-white"
                : "bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-black dark:hover:bg-neutral-200"
            }`}
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? (
              <PulseLoader
                color={url?.includes("/receipt") ? "#ffffff" : "#ff385c"}
                size={7}
                margin={4}
                speedMultiplier={0.6}
              />
            ) : (
              <>{url?.includes("/receipt") ? "Publish" : "Next"}</>
            )}
          </button>
        )}
      </div>
    </footer>
  );
};

export default ListingFooter;
