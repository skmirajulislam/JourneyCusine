const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const House = require("../models/house.model.js");
const Reservation = require("../models/reservation.model.js");
const Review = require("../models/review.model.js");
const { UTApi } = require("uploadthing/server");
require('dotenv').config();

// Helper to extract UploadThing key from CDN URL
const extractUploadThingKey = (url) => {
    if (!url || typeof url !== "string") return null;
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();
        const isUploadThing =
            host === "utfs.io" ||
            host.endsWith(".utfs.io") ||
            host === "ufs.sh" ||
            host.endsWith(".ufs.sh") ||
            host === "uploadthing.com" ||
            host.endsWith(".uploadthing.com") ||
            host === "uploadthing-prod.s3.us-west-2.amazonaws.com" ||
            host === "ingest.uploadthing.com";

        if (!isUploadThing) return null;

        const match = parsed.pathname.match(/\/f\/([^?#]+)/);
        if (match && match[1]) {
            return match[1];
        }

        const parts = parsed.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || null;
    } catch {
        return null;
    }
};

// Helper to delete from Cloud storage if hosted on UploadThing
const deleteFromCloudIfUploadThing = async (imageUrl) => {
    const fileKey = extractUploadThingKey(imageUrl);
    if (!fileKey) {
        return { deletedFromCloud: false, provider: "external" };
    }

    try {
        const token = process.env.UPLOADTHING_TOKEN;
        const utapi = new UTApi(token ? { token } : {});
        await utapi.deleteFiles(fileKey);
        return { deletedFromCloud: true, provider: "uploadthing", fileKey };
    } catch (err) {
        console.error("UploadThing cloud deletion error:", err);
        return { deletedFromCloud: false, provider: "uploadthing", error: err.message };
    }
};

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
        const { minPrice, maxPrice, minRating } = req.query;
        let query = {
            status: "Complete",
            "photos.0": { $exists: true },
        };

        if ((minPrice !== undefined && minPrice !== "" && minPrice !== "all") || (maxPrice !== undefined && maxPrice !== "" && maxPrice !== "all")) {
            query.basePrice = {};
            if (minPrice !== undefined && minPrice !== "" && minPrice !== "all") {
                query.basePrice.$gte = Number(minPrice);
            }
            if (maxPrice !== undefined && maxPrice !== "" && maxPrice !== "all" && Number(maxPrice) < 1000) {
                query.basePrice.$lte = Number(maxPrice);
            }
        }

        const data = await House.find(query).lean();

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

        let allListingData = data
            .map((listing) => {
                const stats = ratingsMap[String(listing._id)];
                return {
                    ...listing,
                    ratings: stats ? stats.avgRating : null,
                    reviews: stats ? `${stats.reviewsCount} review${stats.reviewsCount === 1 ? "" : "s"}` : "No reviews",
                    reviewsCount: stats ? stats.reviewsCount : 0,
                };
            });

        if (minRating && Number(minRating) > 0) {
            const parsedMinRate = Number(minRating);
            allListingData = allListingData.filter((item) => {
                const r = parseFloat(item.ratings);
                return !isNaN(r) && r >= parsedMinRate;
            });
        }

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
        const { minPrice, maxPrice, minRating } = req.query || {};

        let query = {
            houseType: { $eq: category }
        };

        if ((minPrice !== undefined && minPrice !== "" && minPrice !== "all") || (maxPrice !== undefined && maxPrice !== "" && maxPrice !== "all")) {
            query.basePrice = {};
            if (minPrice !== undefined && minPrice !== "" && minPrice !== "all") {
                query.basePrice.$gte = Number(minPrice);
            }
            if (maxPrice !== undefined && maxPrice !== "" && maxPrice !== "all" && Number(maxPrice) < 1000) {
                query.basePrice.$lte = Number(maxPrice);
            }
        }

        const data = await House.find(query).lean();

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

        let catBasedListing = data.map((listing) => {
            const stats = ratingsMap[String(listing._id)];
            return {
                ...listing,
                ratings: stats ? stats.avgRating : null,
                reviews: stats ? `${stats.reviewsCount} review${stats.reviewsCount === 1 ? "" : "s"}` : "No reviews",
                reviewsCount: stats ? stats.reviewsCount : 0,
            };
        });

        if (minRating && Number(minRating) > 0) {
            const parsedMinRate = Number(minRating);
            catBasedListing = catBasedListing.filter((item) => {
                const r = parseFloat(item.ratings);
                return !isNaN(r) && r >= parsedMinRate;
            });
        }

        const response = {
            succeed: 1,
            status: 200,
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
                authorDetails = await User.findById(listingData.author).select("-password -accessToken -refreshToken -token");
            } catch (err) {
                console.error("Error finding author by ID:", err);
            }
        }

        // If no author found by listing.author, fallback to active host or admin user in database
        if (!authorDetails) {
            authorDetails = await User.findOne({
                $or: [{ role: "host" }, { role: "admin" }]
            }).select("-password -accessToken -refreshToken -token");
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

        // Clean up any removed UploadThing photos from the cloud
        if (Array.isArray(updateData.photos) && Array.isArray(house.photos)) {
            const newPhotoSet = new Set(updateData.photos);
            const removedPhotos = house.photos.filter((p) => !newPhotoSet.has(p));
            for (const removedUrl of removedPhotos) {
                await deleteFromCloudIfUploadThing(removedUrl);
            }
        }

        const allowedFields = [
            "title", "description", "houseType", "privacyType", "location",
            "floorPlan", "amenities", "photos", "highlights", "cuisineSpecialties",
            "localFoodSecrets", "cuisineOfferings", "basePrice", "priceAfterTaxes",
            "authorEarnedPrice", "security", "visibility", "guestType", "ratings", "status"
        ];
        const sanitizedFields = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                sanitizedFields[field] = updateData[field];
            }
        }

        if (sanitizedFields.status === "published" || sanitizedFields.status === "Live") {
            sanitizedFields.status = "Complete";
        }

        const updatedHouse = await House.findByIdAndUpdate(
            houseObjId,
            { $set: sanitizedFields },
            { new: true }
        );

        res.status(200).json({ success: 1, message: "Listing updated successfully", house: updatedHouse });
    } catch (error) {
        console.error("updateListing error:", error);
        res.status(500).json({ success: 0, message: "Failed to update listing" });
    }
};

/**
 * Delete a specific image from Cloud storage (UploadThing) and Database
 * POST /house/delete_image
 * Body: { houseId, imageUrl }
 */
exports.deleteImage = async (req, res) => {
    try {
        const userId = req.user;
        const { houseId, imageUrl } = req.body;

        if (!imageUrl || typeof imageUrl !== "string") {
            return res.status(400).json({ success: 0, message: "Valid image URL is required" });
        }

        let deletedFromCloud = false;
        let provider = "external";

        // 1. Check if the image is in UploadThing cloud
        const cloudRes = await deleteFromCloudIfUploadThing(imageUrl);
        deletedFromCloud = cloudRes.deletedFromCloud;
        provider = cloudRes.provider;

        let updatedPhotos = [];

        // 2. If houseId is provided, remove image from listing in database
        if (houseId && mongoose.Types.ObjectId.isValid(houseId)) {
            const house = await House.findById(new mongoose.Types.ObjectId(houseId));
            if (!house) {
                return res.status(404).json({ success: 0, message: "Listing not found" });
            }

            // Check authorization (must be author of the listing)
            if (house.author && String(house.author) !== String(userId)) {
                return res.status(403).json({ success: 0, message: "Unauthorized to modify this listing" });
            }

            const updatedHouse = await House.findByIdAndUpdate(
                house._id,
                { $pull: { photos: imageUrl } },
                { new: true }
            );
            updatedPhotos = updatedHouse ? updatedHouse.photos : [];
        }

        if (deletedFromCloud) {
            return res.status(200).json({
                success: 1,
                message: "Image deleted from UploadThing cloud and database",
                deletedFromCloud: true,
                provider,
                photos: updatedPhotos,
            });
        } else {
            return res.status(200).json({
                success: 1,
                message: "Image removed from database",
                deletedFromCloud: false,
                provider,
                photos: updatedPhotos,
            });
        }
    } catch (error) {
        console.error("deleteImage error:", error);
        return res.status(500).json({ success: 0, message: error.message || "Failed to delete image" });
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

        // Clean up all UploadThing photos for this listing from the cloud
        if (Array.isArray(house.photos)) {
            for (const photoUrl of house.photos) {
                await deleteFromCloudIfUploadThing(photoUrl);
            }
        }

        await House.findByIdAndDelete(houseObjId);

        // Also clean up any reservations associated with this house
        try {
            await Reservation.deleteMany({ listingId: String(id) });
        } catch (rErr) {
            console.error("Reservation cleanup error:", rErr);
        }

        res.status(200).json({ success: 1, message: "Listing and cloud photos deleted successfully" });
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