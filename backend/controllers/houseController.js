const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const House = require("../models/house.model.js");
const Reservation = require("../models/reservation.model.js");
const Review = require("../models/review.model.js");
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
        const data = await House.find({}).lean();

        // Dynamically compute average ratings from Review collection
        const reviewStats = await Review.aggregate([
            {
                $group: {
                    _id: "$listingId",
                    avgRating: { $avg: "$rating" },
                    reviewsCount: { $sum: 1 },
                },
            },
        ]);

        const ratingsMap = {};
        reviewStats.forEach((r) => {
            ratingsMap[String(r._id)] = {
                avgRating: Number(r.avgRating.toFixed(1)),
                reviewsCount: r.reviewsCount,
            };
        });

        const allListingData = data
            .filter((listing) => listing.status === "Complete" && listing.photos?.length !== 0)
            .map((listing) => {
                const stats = ratingsMap[String(listing._id)];
                return {
                    ...listing,
                    ratings: stats ? stats.avgRating : null,
                    reviews: stats ? `${stats.reviewsCount} review${stats.reviewsCount === 1 ? "" : "s"}` : "No reviews",
                    reviewsCount: stats ? stats.reviewsCount : 0,
                };
            });

        let response = {
            succeed: 1,
            status: 200,
            allListingData
        };
        res.status(200).send(response);
    } catch (error) {
        console.error("getAllListing error:", error);
        res.status(500).json({ error: error.message });
    }
}


exports.getListingDataWithCat = async (req, res) => {
    try {
        const payload = req.body;
        const category = payload.category;

        const data = await House.find({
            houseType: { $eq: category }
        }).lean();

        // Dynamically compute average ratings
        const reviewStats = await Review.aggregate([
            {
                $group: {
                    _id: "$listingId",
                    avgRating: { $avg: "$rating" },
                    reviewsCount: { $sum: 1 },
                },
            },
        ]);

        const ratingsMap = {};
        reviewStats.forEach((r) => {
            ratingsMap[String(r._id)] = {
                avgRating: Number(r.avgRating.toFixed(1)),
                reviewsCount: r.reviewsCount,
            };
        });

        const catBasedListing = data.map((listing) => {
            const stats = ratingsMap[String(listing._id)];
            return {
                ...listing,
                ratings: stats ? stats.avgRating : null,
                reviews: stats ? `${stats.reviewsCount} review${stats.reviewsCount === 1 ? "" : "s"}` : "No reviews",
                reviewsCount: stats ? stats.reviewsCount : 0,
            };
        });

        const response = {
            succeed: 1,
            success: 200,
            catBasedListing
        };

        res.status(200).send(response);
    } catch (error) {
        console.error("getListingDataWithCat error:", error);
        res.status(500).json({ error: error.message });
    }
}

exports.getOneListing = async (req, res) => {
    try {
        const payload = req.body || {};
        const listingId = req.params.id || payload.id || payload.houseId;

        if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
            return res.status(400).json({ error: "Valid listing ID is required" });
        }

        const listingDataDoc = await House.findById(listingId).lean();
        if (!listingDataDoc) {
            return res.status(404).json({ error: "Listing not found" });
        }

        // Dynamically compute average rating from Review collection
        const reviews = await Review.find({ listingId: String(listingId) }).lean();
        const avg = reviews.length > 0
            ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
            : null;

        const listingData = {
            ...listingDataDoc,
            ratings: avg,
            reviews: reviews.length > 0 ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews",
            reviewsCount: reviews.length,
        };

        let authorDetails = null;

        if (listingData.author) {
            try {
                authorDetails = await User.findById(listingData.author).select("-password -token");
            } catch (err) {
                console.error("Error finding author by ID:", err);
            }
        }

        // If no author found by listing.author, fallback to active host or admin user in database
        if (!authorDetails) {
            authorDetails = await User.findOne({
                $or: [{ role: "host" }, { role: "admin" }]
            }).select("-password -token");
        }

        let response = {
            listing: listingData,
            listingAuthor: authorDetails
        };

        res.status(200).send(response);
    } catch (error) {
        console.error("Error in getOneListing:", error);
        res.status(500).json({ error: "Failed to fetch listing details" });
    }
};

exports.updateListing = async (req, res) => {
    try {
        const userId = req.user;
        const { id } = req.params;
        const updateData = req.body || {};

        if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: 0, message: "Invalid listing ID format" });
        }

        const houseObjId = new mongoose.Types.ObjectId(id);
        const house = await House.findById(houseObjId);
        if (!house) {
            return res.status(404).json({ success: 0, message: "Listing not found" });
        }

        // Verify author owns this listing (or is admin)
        if (house.author && house.author.toString() !== userId.toString()) {
            return res.status(403).json({ success: 0, message: "Unauthorized to update this listing" });
        }

        // Calculate priceAfterTaxes & authorEarnedPrice if basePrice is updated
        if (updateData.basePrice) {
            const basePrice = Number(updateData.basePrice);
            const taxes = Math.round((basePrice * 14) / 100);
            updateData.priceAfterTaxes = basePrice + taxes;
            updateData.authorEarnedPrice = Math.round(basePrice * 0.97);
        }

        const updatedHouse = await House.findByIdAndUpdate(
            houseObjId,
            { $set: updateData },
            { new: true }
        );

        res.status(200).json({ success: 1, message: "Listing updated successfully", house: updatedHouse });
    } catch (error) {
        console.error("updateListing error:", error);
        res.status(500).json({ success: 0, message: "Failed to update listing" });
    }
};

exports.deleteListing = async (req, res) => {
    try {
        const userId = req.user;
        const { id } = req.params;

        if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: 0, message: "Invalid listing ID format" });
        }

        const houseObjId = new mongoose.Types.ObjectId(id);
        const house = await House.findById(houseObjId);
        if (!house) {
            return res.status(404).json({ success: 0, message: "Listing not found" });
        }

        // Verify author owns this listing
        if (house.author && house.author.toString() !== userId.toString()) {
            return res.status(403).json({ success: 0, message: "Unauthorized to delete this listing" });
        }

        await House.findByIdAndDelete(houseObjId);

        // Also clean up any reservations associated with this house
        try {
            await Reservation.deleteMany({ listingId: String(id) });
        } catch (rErr) {
            console.error("Reservation cleanup error:", rErr);
        }

        res.status(200).json({ success: 1, message: "Listing deleted successfully" });
    } catch (error) {
        console.error("deleteListing error:", error);
        res.status(500).json({ success: 0, message: "Failed to delete listing" });
    }
};

exports.getAuthorHouses = async (req, res) => {
    try {
        const userId = req.user;
        if (!userId) {
            return res.status(401).json({ success: 0, message: "Unauthorized" });
        }

        const query = [
            { author: String(userId) }
        ];

        if (mongoose.Types.ObjectId.isValid(userId)) {
            query.push({ author: new mongoose.Types.ObjectId(userId) });
        }

        const houses = await House.find({ $or: query }).sort({ created_at: -1 });

        return res.status(200).json({ success: 1, houses });
    } catch (error) {
        console.error("getAuthorHouses error:", error);
        return res.status(500).json({ success: 0, message: "Failed to get author houses" });
    }
};