const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const House = require("../models/house.model.js");
require('dotenv').config() 

exports.saveHouseStructure = async (req, res) => {
    try {
        const userId = req.user;
        const payload = req.body;
        const houseId = payload.houseId;
        const housetype = payload.houseType;
        // console.log(payload, "Line 5")
        const findCriteria = {
            _id: new mongoose.Types.ObjectId(userId)
        }
        const userDetails = await User.findById(findCriteria);
        // console.log(userDetails)
        if (userDetails.role !== "host") {
            throw Error("User is not a host")
        }

        let houseTypeData = {
            houseType: housetype
        }

        let findHouseCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        if (housetype !== undefined) {
            const houseDetails = await House.findOneAndUpdate(findHouseCriteria, houseTypeData, { new: true })

            let response = {
                status: 200,
                succeed: 1,
                info: "Successfully housedata updated",
                houseDetails
            }

            res.status(200).send(response)
        }

    } catch (error) {
        console.log(error)
    }

}

exports.savePrivacyType = async (req, res) => {
    try {
        const userId = req.userId;
        const payload = req.body;
        const houseId = payload.houseId;
        const privacytype = payload.privacyType;

        // console.log(payload, "line 55")

        const findHouseCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            privacyType: privacytype
        }

        if (privacytype !== undefined) {
            const houseDetails = await House.findOneAndUpdate(findHouseCriteria, updateCriteria, { new: true })

            let response = {
                status: 200,
                succeed: 1,
                info: "Successfully housedata updated",
                houseDetails
            }

            res.status(200).send(response)
        }
    } catch (error) {
        console.log(error)
    }
}
exports.saveLocation = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const locationData = payload.location;

        // console.log(payload, "location payload")

        const findHouseCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            location: locationData
        }

        if (locationData !== undefined) {
            const houseDetails = await House.findOneAndUpdate(findHouseCriteria, updateCriteria, { new: true })

            let response = {
                status: 200,
                succeed: 1,
                info: "Successfully housedata updated",
                houseDetails
            }

            res.status(200).send(response)

            // console.log(houseDetails, "Line 98")
        }
    } catch (error) {
        console.log(error)
    }
}

exports.saveFloorPlan = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const floorplanData = payload.floorPlan;

        // console.log(payload, "line 121")

        const findHouseCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            floorPlan: floorplanData
        }

        if (floorplanData !== undefined) {
            const houseDetails = await House.findOneAndUpdate(findHouseCriteria, updateCriteria, { new: true })

            let response = {
                status: 200,
                succeed: 1,
                info: "Successfully housedata updated",
                houseDetails
            }

            res.status(200).send(response)

            // console.log(houseDetails, "line 134")
        }
    } catch (error) {
        console.log(error)
    }
}

exports.saveAmenities = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const amenitiesData = payload.amenities;

        const findHouseCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            amenities: amenitiesData
        }

        if (amenitiesData !== undefined) {
            const houseDetails = await House.findOneAndUpdate(findHouseCriteria, updateCriteria, { new: true })

            let response = {
                status: 200,
                succeed: 1,
                info: "Successfully housedata updated",
                houseDetails
            }

            res.status(200).send(response)

            // console.log(houseDetails, "line 177")

        }

    } catch (error) {
        console.log(error)
    }
}

exports.savePhotos = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const photos = payload.photos;

        // console.log(payload)

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            photos: photos
        }

        const houseDetails = await House.findOneAndUpdate(findCriteria, updateCriteria, { new: true })

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        // console.log(houseDetails, "line 211")

    } catch (error) {
        console.log(error)
    }
}


exports.saveTitle = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const title = payload.title;

        // console.log(payload)

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            title: title
        }

        const houseDetails = await House.findOneAndUpdate(findCriteria, updateCriteria, { new: true })

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        // console.log(houseDetails, "line 248")

    } catch (error) {
        console.log(error)
    }
}

exports.saveHighlight = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const highlight = payload.highlight;

        // console.log(payload)

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            highlight: highlight
        }

        const houseDetails = await House.findOneAndUpdate(findCriteria, updateCriteria, { new: true })

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        // console.log(houseDetails, "line 282")

    } catch (error) {
        console.log(error)
    }
}

exports.saveDescription = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const description = payload.description;

        // console.log(payload)

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            description: description
        }

        const houseDetails = await House.findOneAndUpdate(findCriteria, updateCriteria, { new: true })

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        // console.log(houseDetails, "line 316")

    } catch (error) {
        console.log(error)
    }
}

exports.saveGuestType = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const guestType = payload.guestType;

        // console.log(payload)

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            guestType: guestType
        }

        const houseDetails = await House.findOneAndUpdate(findCriteria, updateCriteria, { new: true })

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        // console.log(houseDetails, "line 350")

    } catch (error) {
        console.log(error)
    }
}

exports.savePrices = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const priceBeforeTaxes = payload.priceBeforeTaxes;
        const authorEarnedPrice = payload.authorEarnedPrice;
        const basePrice = payload.basePrice;

        console.log(payload)

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            priceBeforeTaxes: priceBeforeTaxes,
            authorEarnedPrice: authorEarnedPrice,
            basePrice: basePrice,
        }

        const houseDetails = await House.findOneAndUpdate(findCriteria, updateCriteria, { new: true })
        console.log(houseDetails, "from 378")

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        // console.log(houseDetails, "line 386")

    } catch (error) {
        console.log(error)
    }
}

exports.saveSecurity = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;
        const security = payload.security;

        console.log(payload)

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            security: security
        }

        const houseDetails = await House.findOneAndUpdate(findCriteria, updateCriteria, { new: true })

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        console.log(houseDetails, "line 420")

    } catch (error) {
        console.log(error)
    }
}

exports.getHouseDetails = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const houseDetails = await House.findById(findCriteria)

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        // console.log(houseDetails, "line 447")

    } catch (error) {
        console.log(error)
    }
}


exports.publishList = async (req, res) => {
    try {
        const payload = req.body;
        const houseId = payload.houseId;

        console.log(payload)

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(houseId)
        }

        const updateCriteria = {
            status: "Complete"
        }

        const houseDetails = await House.findOneAndUpdate(findCriteria, updateCriteria, { new: true })

        let response = {
            status: 200,
            succeed: 1,
            info: "Successfully housedata updated",
            houseDetails
        }

        res.status(200).send(response)

        console.log(houseDetails, "line 484")

    } catch (error) {
        console.log(error)
    }
}

exports.getAllListing = async (req, res) => {
    try {
        const data = await House.find({});

        const allListingData = data.filter((listing) => {
            return listing.status === "Complete" && listing.photos.length !== 0
        })
        // console.log(allListingData.length)
        let response = {
            succeed: 1,
            status: 200,
            allListingData
        }
        res.status(200).send(response);
    } catch (error) {
        console.log(error)
    }
}


exports.getListingDataWithCat = async (req, res) => {
    try {
        const payload = req.body;
        const category = payload.category;

        const catBasedListing = await House.find({
            houseType: { $eq: category }
        });

        const response = {
            succeed: 1,
            success: 200,
            catBasedListing
        }

        res.status(200).send(response)
    } catch (error) {
        console.log(error)
    }
}

exports.getOneListing = async (req, res) => {
    try {
        const payload = req.body;
        const listingId = payload.id;

        console.log(listingId, "line 532")

        const findCriteria = {
            _id: new mongoose.Types.ObjectId(listingId)
        }

        const listingData = await House.findById(findCriteria);

        const findAuthorCriteria = {
            _id: new mongoose.Types.ObjectId(listingData.author)
        }

        const authorDetails = await User.findById(findAuthorCriteria)

        let response = {
            listing: listingData,
            listingAuthor: authorDetails
        }

        res.status(200).send(response)
    } catch (error) {
        console.log(error)
    }
}