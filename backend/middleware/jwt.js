const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
require('dotenv').config();

exports.verifyJwtToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ status: 401, message: "Token is not valid" });
    }
    try {
        let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Query user to verify active single session and account status
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ status: 401, message: "User not found" });
        }

        // Single active session check: ensure the token matches the active session in DB
        if (!user.accessToken || user.accessToken !== token) {
            return res.status(401).json({
                status: 401,
                message: "Session expired or logged in from another device. Please log in again."
            });
        }

        // Check if user is temporarily suspended
        if (user.isSuspended && user.suspendedUntil && new Date() < new Date(user.suspendedUntil)) {
            return res.status(403).json({
                status: 403,
                message: `Account is temporarily suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}`
            });
        }

        req.user = user._id;
        req.userData = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ status: 401, message: "Session expired after 1 week. Please log in again." });
        }
        return res.status(401).json({ status: 401, message: "Access denied. Invalid token." });
    }
};

