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
    profileImg: {
        type: String
    },
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

const User = mongoose.model("User", userSchema, "users");

module.exports = User;