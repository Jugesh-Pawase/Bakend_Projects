const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpgenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const passwordUpdated = require("../models/OTP");
const Profile = require("../models/Profile");
require("dotenv").config();

//signup controller
exports.signup = async (req, res) => {
    try {
        //fetch data from request body
        const { firstName, lastName, email, password, confirmPassword,
            accountType, otp } = req.body;
        
        //Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword
            || !accountType || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }
        
        //2 passwords match karlo
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and CofirmPassword values does not match, please try again",
            });
        }

        //check if user already exist
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        //find most recent OTP for the user
        const recentOtp = await OTP.find({ email }).sort({ createAt: -1 }).limit(1);
        console.log(recentOtp);
        
        //validate OTP
        if (recentOtp.length == 0) {
            return res.status(500).json({
                success: false,
                message: "OTP not found",
            });
        } else if (otp != recentOtp[0].otp) {
            return res.status(500).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        //create entry in DB for User
        const user = await User.create({
            firstName, lastName, email, password: hashedPassword,
            accountType, additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        return res.status(200).json({
            success: true,
            message: "User is registered Successfully",
            user,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User cnanot be registered, please try again later",
        });
    }
};

//Login
exports.login = async (req, res) => {
    try {
        //get data from request bosy
        const { email, password } = req.body;

        //data validata\ion
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again",
            });
        }

        //check user exist or not
        const user = await User.findOne({ email }).select("+password").populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first",
            });
        }

        //generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,
                {
                expiresIn: "24h",
                }
            );
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly:true,
            }

            //create cookie and send response
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message:"Logged in successfully",
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Login failure, please try again",
        })
    }  
};

//sendOTP
exports.sendOTP = async (req, res) => {
    try {
        //fetch email from request body
        const { email } = req.body;

        //check user if already exist
        const checkUserPresent = await User.findOne({ email });

        //if user already exist then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already exist",
            })
        }

        //generate otp
        let otp = otpgenerator.generate(6, {
            upperCaseAlphabets: false, 
            specialChars: false, 
            lowerCaseAlphabets: false, 
            digits: true 
        });
        console.log("OTP generated ", otp);

        //check otp already exist or not
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpgenerator.generate(6, {
            upperCaseAlphabets: false, 
            specialChars: false, 
            lowerCaseAlphabets: false, 
            digits: true 
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };
        //create an entry in DB for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfull
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

//changePassword
exports.changePassword = async (req, res) => {
    try {
      const userDetails = await User.findById(req.user.id);
  
      const { oldPassword, newPassword } = req.body;
  
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      );
      if (!isPasswordMatch) {
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" });
      }
  
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      );
  
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        );
        console.log("Email sent successfully:", emailResponse.response);
      } catch (error) {
        console.error("Error occurred while sending email:", error);
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        });
      }
  
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error occurred while updating password:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      });
    }
  };
  