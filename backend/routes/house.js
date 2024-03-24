const express = require("express");
const { saveHouseStructure, savePrivacyType, saveLocation, saveFloorPlan, saveAmenities, savePhotos, saveTitle, saveHighlight, saveDescription, saveGuestType, savePrices, saveSecurity, getHouseDetails, publishList, getAllListing, getListingDataWithCat, getOneListing } = require("../controllers/houseController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");
const router = express.Router();

router.use(express.json())

router.get("/get_all_listing", getAllListing)

router.post("/room_details", getOneListing)
router.post("/get_listing_with_cat", getListingDataWithCat)

router.post("/get_house_details", verifyJwtToken, getHouseDetails)
router.post("/save_structure", verifyJwtToken, saveHouseStructure)
router.post("/save_privacy_type", verifyJwtToken, savePrivacyType)
router.post("/save_house_location", verifyJwtToken, saveLocation)
router.post("/save_floor_plan", verifyJwtToken, saveFloorPlan)
router.post("/save_amenities", verifyJwtToken, saveAmenities)
router.post("/save_photos", verifyJwtToken, savePhotos)
router.post("/save_title", verifyJwtToken, saveTitle)
router.post("/save_highlight", verifyJwtToken, saveHighlight)
router.post("/save_description", verifyJwtToken, saveDescription)
router.post("/save_guesttype", verifyJwtToken, saveGuestType)
router.post("/save_prices", verifyJwtToken, savePrices)
router.post("/save_security", verifyJwtToken, saveSecurity)
router.post("/publish_list", verifyJwtToken, publishList)

module.exports = router