const User = require("../models/user.model.js");
const BlockedEmail = require("../models/blockedEmail.model.js");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const House = require("../models/house.model.js");
require('dotenv').config() 

const saltRounds = 10;
// JWT expiration: 7 days (1 week) persistent session duration.
// Only one active session is valid per user account at any moment.
const TOKEN_EXPIRY = "7d";

exports.signUp = async (req, res, next) => {
    try {
        const payload = req.body;
        if (!payload.name) {
            throw new Error("Please provide user name");
        }
        if (!payload.emailId) {
            throw new Error("Please provide email id");
        }
        if (!payload.birthDate) {
            throw new Error("Please provide date of birth");
        }

        // Check if email is permanently blacklisted
        const isBlocked = await BlockedEmail.findOne({ email: payload.emailId.toLowerCase().trim() });
        if (isBlocked) {
            return res.status(403).json({
                info: "This email address has been permanently blacklisted from Journey Cuisine due to violations of community safety guidelines.",
                success: 0,
                status: 403,
                isBlocked: true
            });
        }

        const passwordHash = await bcrypt.hash(payload.password, saltRounds);
        const { getCurrencyForCountry } = require("../utils/currency.js");
        const resolvedCountry = payload.country || "India";
        const resolvedCurrency = payload.currency || getCurrencyForCountry(resolvedCountry);

        const userObj = {
            name: {
                firstName: payload.name.firstName,
                lastName: payload.name.lastName
            },
            emailId: payload.emailId,
            birthDate: payload.birthDate,
            password: passwordHash,
            country: resolvedCountry,
            currency: resolvedCurrency,
        };

        const user = await User(userObj).save();
        const findCriteria = {
            emailId: payload.emailId
        }
        const userDetails = await User.find(findCriteria);

        const sessionId = crypto.randomUUID();
        const accessToken = jwt.sign(
            {
                _id: userDetails[0]._id,
                role: userDetails[0].role,
                sessionId: sessionId
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
        const refreshToken = jwt.sign(
            { _id: userDetails[0]._id, role: userDetails[0].role, sessionId: sessionId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        const updatedUser = await User.findOneAndUpdate(
            findCriteria,
            { accessToken: accessToken, refreshToken: refreshToken },
            { new: true }
        );

        let response = {
            info: "Welcome to motel",
            success: 1,
            status: 200,
            accessToken: accessToken,
            refreshToken: refreshToken,
            user_details: updatedUser
        };
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        let response = {
            info: "Failed to create user",
            success: 0,
            status: 500
        }
        res.status(500).json({ response });
    }
};

exports.logIn = async (req, res) => {
    const payload = req.body;
    const email = payload.email;
    const password = payload.password;

    try {
        // Check if email is permanently blacklisted
        const isBlocked = await BlockedEmail.findOne({ email: (email || "").toLowerCase().trim() });
        if (isBlocked) {
            return res.status(403).json({
                info: "This email address has been permanently blacklisted from Journey Cuisine due to violations of community safety guidelines.",
                success: 0,
                status: 403,
                isBlocked: true
            });
        }

        const findCriteria = {
            emailId: email
        }
        const userDetails = await User.find(findCriteria).limit(1).exec();

        if (!userDetails || userDetails.length === 0) {
            return res.status(404).json({
                info: "User not found",
                success: 0,
                status: 404
            });
        }

        let isMatched = await bcrypt.compare(password, userDetails[0].password)
        if (isMatched) {
            const sessionId = crypto.randomUUID();
            const accessToken = jwt.sign(
                {
                    _id: userDetails[0]._id,
                    role: userDetails[0].role,
                    sessionId: sessionId
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );
            const refreshToken = jwt.sign(
                { _id: userDetails[0]._id, role: userDetails[0].role, sessionId: sessionId },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            // Storing the newest accessToken and refreshToken enforces single active session
            const updatedUser = await User.findOneAndUpdate(
                findCriteria,
                { accessToken: accessToken, refreshToken: refreshToken },
                { new: true }
            );
            let response = {
                info: "Successfully logged in",
                success: 1,
                status: 200,
                accessToken: accessToken,
                refreshToken: refreshToken,
                user_details: updatedUser
            }
            res.send(response);
        } else if (!isMatched) {
            let response = {
                info: "Incorrect Password",
                success: 0
            }
            res.send(response)
        } else {
            res.send("Not allowed!")
        }
    } catch (error) {
        res.status(500).send()
    }
}



exports.postUser = async (req, res) => {
    res.send(req.user)
}

exports.refreshToken = async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(404).send("Please Log in");
    } else {
        try {
            let decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const userId = decoded._id;
            const findCriteria = {
                _id: new mongoose.Types.ObjectId(userId)
            };
            const userDetails = await User.findById(findCriteria);
            if (!userDetails || userDetails.refreshToken !== refreshToken) {
                return res.sendStatus(403);
            }

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, user) => {
                if (error) {
                    return res.sendStatus(401);
                }

                const accessToken = jwt.sign(
                    {
                        _id: userDetails._id,
                        role: userDetails.role,
                        sessionId: decoded.sessionId || crypto.randomUUID()
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: TOKEN_EXPIRY }
                );

                // Update active accessToken in DB to keep single-session consistency
                await User.findByIdAndUpdate(userDetails._id, { accessToken: accessToken });

                res.json({ accessToken: accessToken });
            });
        } catch (error) {
            console.error(error);
            res.status(401).send("Invalid or expired refresh token");
        }
    }
};

exports.logOut = async (req, res) => {
    const userId = req.user;
    try {
        const userDetails = await User.updateOne(
            { _id: userId },
            {
                $unset: {
                    accessToken: '',
                    refreshToken: '',
                }
            }
        )
        res.send("User logout")
    } catch (error) {
        console.log(error, "Logout error")
    }
}

exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.user;
        const findCriteria = {
            _id: new mongoose.Types.ObjectId(userId)
        };

        const userDetails = await User.findById(findCriteria);
        const housesData = await House.find({
            $or: [
                { author: userId ? userId.toString() : "" },
                ...(mongoose.Types.ObjectId.isValid(userId) ? [{ author: new mongoose.Types.ObjectId(userId) }] : [])
            ]
        });

        let response = {
            info: "user exists",
            status: 200,
            success: 1,
            user_details: userDetails,
            house_data: housesData
        };
        res.send(response);
    } catch (error) {
        console.log(error, "getUserDetails error");
        res.status(500).json({ success: 0, error: "Failed to get user details" });
    }
};

exports.checkEmail = async (req, res) => {
    try {
        const payload = req.body;
        const email = (payload.email || "").toLowerCase().trim();

        // Check if blacklisted
        const isBlocked = await BlockedEmail.findOne({ email });
        if (isBlocked) {
            return res.status(403).json({
                info: "This email address has been permanently blacklisted from Journey Cuisine.",
                success: 0,
                status: 403,
                isBlocked: true
            });
        }

        const findCriteria = {
            emailId: payload.email
        };
        const isEmailExist = await User.find(findCriteria);
        let response;
        if (isEmailExist.length !== 0) {
            response = {
                info: "User email exist.",
                success: 1,
                status: 200
            };
        } else {
            response = {
                info: "User email doesn't exist.",
                success: 0,
                status: 200
            };
        }
        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to search");
    }
};

exports.userProfileDetails = async (req, res) => {
    try {
        const userId = req.user;
        const payload = req.body;
        const profileDetailsName = Array.isArray(payload.valueName) ? payload.valueName[0] : payload.valueName;
        const profileDetailsvalue = Array.isArray(payload.value) ? payload.value[0] : payload.value;
        const fieldName = payload.fieldName;

        if (!fieldName) {
            return res.status(400).json({ success: 0, error: "Field name is required" });
        }

        const updateQuery = {};
        updateQuery[`profileDetails.profile.${fieldName}.name`] = profileDetailsName;
        updateQuery[`profileDetails.profile.${fieldName}.value`] = profileDetailsvalue;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateQuery },
            { new: true }
        );

        res.status(200).json({
            success: 1,
            message: "Profile detail updated successfully",
            user_details: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile field:", error);
        res.status(500).json({ success: 0, error: "An error occurred while updating the field" });
    }
};

exports.userProfileAbout = async (req, res) => {
    try {
        const userId = req.user;
        const payload = req.body;
        const { profileDetailsAbout } = payload;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { "profileDetails.about": profileDetailsAbout } },
            { new: true }
        );

        res.status(200).json({
            success: 1,
            message: "About section updated successfully",
            user_details: updatedUser
        });
    } catch (error) {
        console.error("Error updating about section:", error);
        res.status(500).json({ success: 0, error: "An error occurred while updating the about section" });
    }
};

exports.updateUserName = async (req, res) => {
    try {
        const userId = req.user;
        const { firstName, lastName } = req.body;

        if (!firstName || !firstName.trim()) {
            return res.status(400).json({ success: 0, error: "First name is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "name.firstName": firstName.trim(),
                    "name.lastName": lastName ? lastName.trim() : "",
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: 1,
            message: "Name updated successfully",
            user_details: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user name:", error);
        res.status(500).json({ success: 0, error: "An error occurred while updating name" });
    }
};

exports.updateUserCountry = async (req, res) => {
    try {
        const userId = req.user;
        const { country, currency } = req.body;
        const { getCurrencyForCountry } = require("../utils/currency.js");

        if (!country) {
            return res.status(400).json({ success: 0, error: "Country is required" });
        }

        const resolvedCurrency = currency || getCurrencyForCountry(country);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    country: country.trim(),
                    currency: resolvedCurrency.toUpperCase().trim(),
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: 1,
            message: `Country updated to ${country} (${resolvedCurrency}) successfully`,
            user_details: updatedUser,
        });
    } catch (error) {
        console.error("Error updating country/currency:", error);
        res.status(500).json({ success: 0, error: "Failed to update country and currency" });
    }
};

exports.uploadProfileImage = async (req, res) => {
    try {
        const profileImg = req.body.profileImg;
        const userId = req.user;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profileImg: profileImg } },
            { new: true }
        );

        let response = {
            success: 1,
            info: "Successfully uploaded",
            profileImg: updatedUser ? updatedUser.profileImg : profileImg,
            user_details: updatedUser
        };
        res.status(200).send(response);
    } catch (error) {
        console.error("Error uploading profile image:", error);
        res.status(500).json({ success: 0, error: "Failed to upload image" });
    }
};

exports.toggleWishlist = async (req, res) => {
    try {
        const userId = req.user;
        const { houseId } = req.body;

        if (!houseId) {
            return res.status(400).json({ success: 0, error: "House ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: 0, error: "User not found" });
        }

        const wishlist = user.wishlist || [];
        const isSaved = wishlist.some((id) => id.toString() === houseId.toString());

        let updatedUser;
        if (isSaved) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $pull: { wishlist: new mongoose.Types.ObjectId(houseId) } },
                { new: true }
            );
            return res.status(200).json({
                success: 1,
                action: "removed",
                isSaved: false,
                wishlist: updatedUser.wishlist,
                message: "Removed from wishlist"
            });
        } else {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { wishlist: new mongoose.Types.ObjectId(houseId) } },
                { new: true }
            );
            return res.status(200).json({
                success: 1,
                action: "added",
                isSaved: true,
                wishlist: updatedUser.wishlist,
                message: "Saved to wishlist!"
            });
        }
    } catch (error) {
        console.error("Wishlist toggle error:", error);
        return res.status(500).json({ success: 0, error: "Failed to update wishlist" });
    }
};

exports.addWishlist = exports.toggleWishlist;

exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId).populate({
            path: "wishlist",
            model: "House"
        });

        if (!user) {
            return res.status(404).json({ success: 0, error: "User not found" });
        }

        // Return only complete listings in wishlist
        const validWishlist = (user.wishlist || []).filter(
            (item) => item && (item.photos && item.photos.length > 0)
        );

        return res.status(200).json({
            success: 1,
            wishlist: validWishlist
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        return res.status(500).json({ success: 0, error: "Failed to retrieve wishlist" });
    }
};

exports.userToHost = async (req, res) => {
    try {
        const userId = req.user;
        const role = req.body.role;
        const findCriteria = {
            _id: new mongoose.Types.ObjectId(userId)
        };
        const updatedUserDetails = await User.findOneAndUpdate(findCriteria, { role: role }, { new: true });

        const id = {
            author: updatedUserDetails._id
        };

        const updateNewHouseAuthor = await House(id).save();

        const response = {
            house: updateNewHouseAuthor,
            updatedUserDetails,
            info: "User role updated",
            succeed: 1
        };
        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: 0, error: "Failed to update role" });
    }
};