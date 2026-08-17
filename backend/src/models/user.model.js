const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        firstName: {
            type: String,
            default: "",
            required: true,
        },
        lastName: {
            type: String,
            default: "",
            required: true,
        },
    },
    birthDate: {
        type: String,
        default: "0000/00/00",
    },
    emailId: {
        type: String,
        default: "",
        required: true,
        unique: true
    },
    profileImg: {
        type: String,
        default: "",
    },
    password: {
        type: String
    },
    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String
    },
    role: {
        type: String,
        default: "visitors",
    },
    country: {
        type: String,
        default: "India",
    },
    countryCode: {
        type: String,
        default: "IN",
    },
    currency: {
        type: String,
        default: "INR",
    },
    phoneNumber: {
        dialCode: { type: String, default: "+91" },
        number: { type: String, default: "" },
        fullNumber: { type: String, default: "" },
    },
    offensiveWarnings: {
        type: Number,
        default: 0,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    },
    suspendedUntil: {
        type: Date,
        default: null,
    },
    loyaltyPoints: {
        type: Number,
        default: 200,
    },
    lastDailyClaim: {
        type: Date,
        default: null,
    },
    passportBadges: [{
        badgeId: { type: String, required: true },
        name: { type: String, required: true },
        icon: { type: String, default: "🍽️" },
        description: { type: String, default: "" },
        category: { type: String, default: "culinary" },
        unlockedAt: { type: Date, default: Date.now }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    }],
    profileDetails: {
        profileType: {
            type: String,
            default: "visitors"
        },
        profile: {
            school: {
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            },
            profession: {
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            },
            presentAddress: {
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            },
            favoriteSong: {
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            },
            obsessedWith: {
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            },
            funFact: {
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            },
            spendTime: {
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            },
            pets: {
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            }
        },
        about: {
            type: String
        },
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

// Register userDB alias to ensure compatibility with all populate queries
if (!mongoose.models.userDB) {
    mongoose.model("userDB", userSchema, "users");
}

module.exports = User;