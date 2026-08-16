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
    },
    // Cuisine & Dining Experiences (Add-ons)
    cuisineOfferings: [
        {
            title: { type: String, required: true },
            description: { type: String, default: "" },
            price: { type: Number, required: true }, // price per guest / experience in USD
            type: { 
                type: String, 
                enum: ["breakfast", "lunch", "dinner", "chef_experience", "cooking_class", "wine_tasting", "snack_platter"],
                default: "breakfast"
            },
            dietary: [{ type: String }], // ["vegetarian", "vegan", "halal", "kosher", "gluten_free", "organic"]
            maxGuests: { type: Number, default: 10 },
            photos: [{ type: String }]
        }
    ],
    // Local Food Secrets (Neighborhood culinary recommendations)
    localFoodSecrets: [
        {
            name: { type: String, required: true },
            category: { 
                type: String, 
                enum: ["street_food", "fine_dining", "bakery", "cafe", "vineyard", "market", "seafood_shack"],
                default: "cafe"
            },
            description: { type: String, default: "" },
            address: { type: String, default: "" },
            recommendedDish: { type: String, default: "" },
            priceRange: { type: String, enum: ["$", "$$", "$$$", "$$$$"], default: "$$" },
            lat: { type: Number },
            lng: { type: Number }
        }
    ],
    // Specific kitchen capabilities
    kitchenFeatures: [{ type: String }] // ["chef_kitchen", "bbq_grill", "pizza_oven", "halal_cookware", "vegetarian_dedicated", "espresso_bar", "dishwasher"]
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const House = mongoose.model("House", houseSchema);

module.exports = House;