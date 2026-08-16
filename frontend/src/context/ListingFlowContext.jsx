/* eslint-disable react-refresh/only-export-components */
 
import { createContext, useContext, useState, useEffect } from "react";
import api from "../backend";
import { toast } from "react-hot-toast";

const ListingFlowContext = createContext(null);

export const ListingFlowProvider = ({ children }) => {
  const [newHouse, setNewHouse] = useState(null);
  const [currentListingHouse, setCurrentListingHouse] = useState(null);

  // Restore currentHouseId from localStorage on mount only if user is logged in
  useEffect(() => {
    const hasToken = localStorage.getItem("accessToken") || localStorage.getItem("refreshToken");
    const houseId = localStorage.getItem("currentHouseId");
    if (hasToken && houseId && !currentListingHouse) {
      getHouseDetails(houseId);
    }
  }, []);

  const getHouseDetails = async (id) => {
    if (!id) return;
    const hasToken = localStorage.getItem("accessToken") || localStorage.getItem("refreshToken");
    if (!hasToken) {
      return;
    }
    try {
      const res = await api.post("/house/get_house_details", { houseId: id }, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        localStorage.removeItem("currentHouseId");
      }
    }
  };

  const createNewHouse = (houseData) => {
    setNewHouse(houseData);
  };

  const saveStructure = async (structureData) => {
    try {
      const res = await api.post("/house/save_structure", structureData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving structure:", error);
    }
  };

  const savePrivacyType = async (privacyData) => {
    try {
      const res = await api.post("/house/save_privacy_type", privacyData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving privacy type:", error);
    }
  };

  const saveLocation = async (locationData) => {
    try {
      const res = await api.post("/house/save_house_location", locationData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const saveFloorPlan = async (floorPlanData) => {
    try {
      const res = await api.post("/house/save_floor_plan", floorPlanData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving floor plan:", error);
    }
  };

  const saveAmenities = async (amenitiesData) => {
    try {
      const res = await api.post("/house/save_amenities", amenitiesData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving amenities:", error);
    }
  };

  const savePhotos = async (photosData) => {
    try {
      const res = await api.post("/house/save_photos", photosData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving photos:", error);
    }
  };

  const saveHouseTitle = async (titleData) => {
    try {
      const res = await api.post("/house/save_title", titleData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving title:", error);
    }
  };

  const saveHouseHighlights = async (highlightsData) => {
    try {
      const res = await api.post("/house/save_highlight", highlightsData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving highlights:", error);
    }
  };

  const saveHouseDescription = async (descData) => {
    try {
      const res = await api.post("/house/save_description", descData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };

  const saveHousePrices = async (priceData) => {
    try {
      const res = await api.post("/house/save_prices", priceData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving prices:", error);
    }
  };

  const saveSecurity = async (securityData) => {
    try {
      const res = await api.post("/house/save_security", securityData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && res.data?.houseDetails) {
        setCurrentListingHouse(res.data.houseDetails);
        return res.data.houseDetails;
      }
    } catch (error) {
      console.error("Error saving security:", error);
    }
  };

  const publishListing = async (publishData) => {
    try {
      const res = await api.post("/house/publish_listing", publishData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        toast.success("Listing published successfully!");
        localStorage.removeItem("currentHouseId");
        setCurrentListingHouse(null);
        setNewHouse(null);
        return res.data;
      }
    } catch (error) {
      console.error("Error publishing listing:", error);
      toast.error("Failed to publish listing");
    }
  };

  const value = {
    newHouse,
    setNewHouse,
    createNewHouse,
    currentListingHouse,
    setCurrentListingHouse,
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
  };

  return (
    <ListingFlowContext.Provider value={value}>
      {children}
    </ListingFlowContext.Provider>
  );
};

export const useListingFlow = () => {
  const context = useContext(ListingFlowContext);
  if (!context) {
    throw new Error("useListingFlow must be used within a ListingFlowProvider");
  }
  return context;
};

export default ListingFlowContext;
