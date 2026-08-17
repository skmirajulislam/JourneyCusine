const User = require("../models/user.model.js");
const BlockedEmail = require("../models/blockedEmail.model.js");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const House = require("../models/house.model.js");
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

const saltRounds = 12;
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
        const resolvedCountryCode = payload.countryCode || "IN";
        const resolvedCurrency = payload.currency || getCurrencyForCountry(resolvedCountry);
        const resolvedPhone = payload.phoneNumber || {
            dialCode: payload.dialCode || "+91",
            number: payload.phone || payload.mobile || "",
            fullNumber: `${payload.dialCode || "+91"} ${payload.phone || payload.mobile || ""}`.trim(),
        };

        const userObj = {
            name: {
                firstName: payload.name.firstName,
                lastName: payload.name.lastName
            },
            emailId: payload.emailId,
            birthDate: payload.birthDate,
            password: passwordHash,
            country: resolvedCountry,
            countryCode: resolvedCountryCode,
            currency: resolvedCurrency,
            phoneNumber: resolvedPhone,
        };

        const user = await User(userObj).save();
        const userDetails = await User.findById(user._id);

        const sessionId = crypto.randomUUID();
        const accessToken = jwt.sign(
            {
                _id: userDetails._id,
                role: userDetails.role,
                sessionId: sessionId
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
        const refreshToken = jwt.sign(
            { _id: userDetails._id, role: userDetails.role, sessionId: sessionId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
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
    const payload = req.body || {};
    const email = typeof payload.email === "string" ? payload.email.toLowerCase().trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    try {
        if (!email || !password) {
            return res.status(400).json({
                info: "Email and password are required",
                success: 0,
                status: 400
            });
        }

        // Check if email is permanently blacklisted
        const isBlocked = await BlockedEmail.findOne({ email });
        if (isBlocked) {
            return res.status(403).json({
                info: "This email address has been permanently blacklisted from Journey Cuisine due to violations of community safety guidelines.",
                success: 0,
                status: 403,
                isBlocked: true
            });
        }

        const user = await User.findOne({ emailId: email }).exec();

        if (!user) {
            return res.status(404).json({
                info: "User not found",
                success: 0,
                status: 404
            });
        }

        let isMatched = await bcrypt.compare(password, user.password);
        if (isMatched) {
            const sessionId = crypto.randomUUID();
            const accessToken = jwt.sign(
                {
                    _id: user._id,
                    role: user.role,
                    sessionId: sessionId
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );
            const refreshToken = jwt.sign(
                { _id: user._id, role: user.role, sessionId: sessionId },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            // Storing the newest accessToken and refreshToken enforces single active session
            const updatedUser = await User.findByIdAndUpdate(
                user._id,
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
        const payload = req.body || {};
        const email = typeof payload.email === "string" ? payload.email.toLowerCase().trim() : "";

        if (!email) {
            return res.status(400).json({
                info: "Email is required",
                success: 0,
                status: 400
            });
        }

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

        const isEmailExist = await User.find({ emailId: email });
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

        if (!fieldName || typeof fieldName !== "string" || !/^[a-zA-Z0-9_]{1,40}$/.test(fieldName)) {
            return res.status(400).json({ success: 0, error: "Valid field name is required" });
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
        const profileImg = req.body.profileImg || req.body.url;
        const rawUserId = req.user || req.body?.id;

        if (!rawUserId || !mongoose.Types.ObjectId.isValid(String(rawUserId))) {
            return res.status(400).json({ success: 0, error: "Valid user ID is required" });
        }
        const userObjectId = new mongoose.Types.ObjectId(String(rawUserId));

        if (!profileImg || typeof profileImg !== "string") {
            return res.status(400).json({ success: 0, error: "Image URL is required" });
        }

        // Fetch existing user to check if there is an existing profile image in UploadThing
        const existingUser = await User.findById(userObjectId);
        const previousProfileImg = existingUser?.profileImg;

        // If re-uploading and user had a previous image in UploadThing, delete it from cloud storage
        if (previousProfileImg && previousProfileImg !== profileImg) {
            const prevKey = extractUploadThingKey(previousProfileImg);
            if (prevKey) {
                try {
                    const token = process.env.UPLOADTHING_TOKEN;
                    const utapi = new UTApi(token ? { token } : {});
                    await utapi.deleteFiles(prevKey);
                } catch (delErr) {
                    console.error("Failed to delete previous profile image from UploadThing:", delErr);
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userObjectId,
            { $set: { profileImg: profileImg } },
            { new: true }
        );

        let response = {
            success: 1,
            info: "Profile image updated successfully",
            message: "Profile image updated and previous cloud image deleted",
            profileImg: updatedUser ? updatedUser.profileImg : profileImg,
            user_details: updatedUser
        };
        res.status(200).send(response);
    } catch (error) {
        console.error("Error uploading profile image:", error);
        res.status(500).json({ success: 0, error: "Failed to upload image" });
    }
};

exports.deleteProfileImage = async (req, res) => {
    try {
        const rawUserId = req.user || req.body?.id;
        if (!rawUserId || !mongoose.Types.ObjectId.isValid(String(rawUserId))) {
            return res.status(400).json({ success: 0, error: "Valid user ID is required" });
        }
        const userObjectId = new mongoose.Types.ObjectId(String(rawUserId));

        const user = await User.findById(userObjectId);
        if (!user) {
            return res.status(404).json({ success: 0, error: "User not found" });
        }

        if (user.profileImg) {
            const prevKey = extractUploadThingKey(user.profileImg);
            if (prevKey) {
                try {
                    const token = process.env.UPLOADTHING_TOKEN;
                    const utapi = new UTApi(token ? { token } : {});
                    await utapi.deleteFiles(prevKey);
                } catch (delErr) {
                    console.error("Failed to delete profile image from UploadThing:", delErr);
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userObjectId,
            { $set: { profileImg: "" } },
            { new: true }
        );

        res.status(200).json({
            success: 1,
            message: "Profile image removed from cloud and database",
            user_details: updatedUser
        });
    } catch (error) {
        console.error("Error deleting profile image:", error);
        res.status(500).json({ success: 0, error: "Failed to delete profile image" });
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
        const role = typeof req.body?.role === "string" ? req.body.role : "host";
        const userObjId = new mongoose.Types.ObjectId(userId);
        const updatedUserDetails = await User.findByIdAndUpdate(userObjId, { role: role }, { new: true });

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

exports.verifyPhoneForReset = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        if (!email || !phoneNumber) {
            return res.status(400).json({ success: 0, message: "Email and registered phone number are required." });
        }

        const user = await User.findOne({ emailId: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: 0, message: "No account found with this email address." });
        }

        // Normalize numbers for comparison (keep digits only)
        const cleanInput = phoneNumber.replace(/\D/g, "");
        const cleanUserNumber = (user.phoneNumber?.number || "").replace(/\D/g, "");
        const cleanUserFull = (user.phoneNumber?.fullNumber || "").replace(/\D/g, "");

        // If user hasn't set a phone number yet or test user
        const isMatch =
            (cleanUserNumber && (cleanUserNumber === cleanInput || cleanInput.endsWith(cleanUserNumber) || cleanUserNumber.endsWith(cleanInput))) ||
            (cleanUserFull && (cleanUserFull === cleanInput || cleanInput.endsWith(cleanUserFull) || cleanUserFull.endsWith(cleanInput))) ||
            (cleanInput.length >= 7 && (cleanUserNumber === "" && cleanUserFull === "")); // Allow setting if none was registered previously

        if (!isMatch) {
            return res.status(400).json({
                success: 0,
                message: "Phone number does not match our registered records for this account.",
            });
        }

        return res.status(200).json({
            success: 1,
            message: "Phone number verified successfully!",
        });
    } catch (error) {
        console.error("verifyPhoneForReset error:", error);
        return res.status(500).json({ success: 0, message: "Error verifying phone number. Please try again." });
    }
};

exports.resetPasswordWithPhone = async (req, res) => {
    try {
        const { email, phoneNumber, newPassword } = req.body;
        if (!email || !phoneNumber || !newPassword) {
            return res.status(400).json({ success: 0, message: "All fields are required." });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: 0, message: "Password must be at least 8 characters long." });
        }

        const user = await User.findOne({ emailId: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: 0, message: "No account found with this email address." });
        }

        // Validate phone match again
        const cleanInput = phoneNumber.replace(/\D/g, "");
        const cleanUserNumber = (user.phoneNumber?.number || "").replace(/\D/g, "");
        const cleanUserFull = (user.phoneNumber?.fullNumber || "").replace(/\D/g, "");

        const isMatch =
            (cleanUserNumber && (cleanUserNumber === cleanInput || cleanInput.endsWith(cleanUserNumber) || cleanUserNumber.endsWith(cleanInput))) ||
            (cleanUserFull && (cleanUserFull === cleanInput || cleanInput.endsWith(cleanUserFull) || cleanUserFull.endsWith(cleanInput))) ||
            (cleanInput.length >= 7 && (cleanUserNumber === "" && cleanUserFull === ""));

        if (!isMatch) {
            return res.status(400).json({
                success: 0,
                message: "Phone verification failed. Please try again.",
            });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const sessionId = crypto.randomUUID();
        const accessToken = jwt.sign(
            { id: user._id, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        const refreshToken = jwt.sign(
            { id: user._id, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        user.password = hashedPassword;
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        // If phone wasn't set earlier, save the verified phone
        if (!user.phoneNumber || !user.phoneNumber.number) {
            user.phoneNumber = {
                dialCode: "+91",
                number: cleanInput.slice(-10),
                fullNumber: phoneNumber,
            };
        }

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        return res.status(200).json({
            success: 1,
            message: "🎉 Password successfully updated!",
            user_details: userObj,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("resetPasswordWithPhone error:", error);
        return res.status(500).json({ success: 0, message: "Failed to reset password. Please try again." });
    }
};