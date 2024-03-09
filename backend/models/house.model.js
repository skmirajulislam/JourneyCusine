const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
    author: {
        type: String
    },
    status: {
        type: String,
        default: "In progress"
    },
    houseType: {
        type: String,
    },
    privacyType: {
        type: String
    },
    location: {
        country: {
            type: {}
        },
        addressLineOne: {
            type: String
        },
        addressLineTwo: {
            type: String
        },
        city: {
            type: {}
        },
        state: {
            type: {},
        },
        postCode: {
            type: String
        }
    },
    floorPlan: {
        guests: {
            type: Number
        },
        bedrooms: {
            type: Number
        },
        beds: {
            type: Number
        },
        bathroomsNumber: {
            type: Number
        }

    },
    amenities: {
        type: Array
    },
    photos: {
        type: Array
    },
    title: {
        type: String
    },
    highlight: {
        type: Array
    },
    description: {
        type: String
    },
    visibility: {
        type: String
    },
    guestType: {
        type: String
    },
    priceAfterTaxes: {
        type: Number
    },
    authorEarnedPrice: {
        type: Number
    },
    basePrice: {
        type: Number
    },
    security: {
        type: Array
    },
    ratings: {
        type: Number,
        default: null
    }

}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const House = mongoose.model("House", houseSchema);

module.exports = House;