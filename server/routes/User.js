//import the require modules
const express = require("express");
const router = express.Router();

const {
    login,
    signup,
    sendOTP,
    changePassword,
} = require("../controllers/Auth");

const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

//Routes for login signup and authentication (Authentication Routes)
//route for user login
router.post("/login", login);

//route for user signup
router.post("/signup", signup);

//route for sending OTP to the user's email
router.post("/sendotp", sendOTP);

//Route for change the password
router.post("/changepassword", auth, changePassword);

//Reset Password
//Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

//Route for reset user's password after verificaion
router.post("/reset-password", resetPassword);

//Export the router for use in the main applicatio
module.exports = router;