const jwt = require("jsonwebtoken");
require('dotenv').config() 

exports.verifyJwtToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : null;
    // console.log(token, "LINE 7 JWT");

    if (!token) {
        return res.send("token is not valid");
    }
    try {
        let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decoded);
        req.user = decoded._id;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).send("Access denied. Invalid token.");
    }
};
