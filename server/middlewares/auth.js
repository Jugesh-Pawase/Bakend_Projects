const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try {
        //extract JWT token
        const token =
            req.body.token ||
            req.cookies.token ||
            req.header("Authorization").replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        //verify the token
        try {
            const payload = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(payload);
            req.user = payload;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "token is invalid",
            });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while verifying the token",
        });
    }
};

//isStudent
exports.isStudent = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        if (userDetails.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for students",
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role is not matching",
        });
    }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        if (userDetails.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Instructor",
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role is not matching",
        });
    }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        if (userDetails.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin",
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role is not matching",
        });
    }
};