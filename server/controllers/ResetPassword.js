const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req.body
        const email = req.body.email;

        // check user for email and validate 
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Your email is not registered with us",
            });
        }
        console.log("email:- ", email);
        // generate token
        const token = crypto.randomUUID();
        console.log("Generated Token: ", token);

        //  update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({ email: email }, {
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 10 * 60 * 1000,
        }, { new: true });
        console.log("Updated User Details: ", updatedDetails);
        console.log("Token Expiry: ", updatedDetails.resetPasswordExpires);
        console.log("Current Time: ", Date.now());


        // create url 
        const url = `http://localhost:3000/update-password/${token}`;

        // send email containing url 
        await mailSender(email, "Password Reset Link", `Password Reset Link: ${url}`);
        
        // return response
        return res.json({
            success: true,
            message: "email sent successfully plz check email and change password",
        });

    } catch (error) {
        console.log("something went wrong while reset password", error)
        res.status(500).json({
            success: false,
            message: "something went wrong while reset password ",
        })
    }
    // 1:28 
};

//resetPassword
exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        let { password, confirmPassword, token } = req.body;

        // Extract token if full URL is sent
        if (token.startsWith("http")) {
            token = token.split('/').pop(); // Extract the last part of the URL
        }
        console.log("Received Token: ", token);

        // validation 
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password not matching",
            });
        }
        
        //get user details
        const userDetails = await User.findOne({ resetPasswordToken: token });

        console.log("User details: ", userDetails);
        //if no entry-Invalid token 
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is invalid ",
            });
        }
        //time for token 
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token is Expired please regenerate your token ",
            });
        }
        // hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // update password 
        await User.findOneAndUpdate({ resetPasswordToken: token }, { password: hashedPassword, token: null }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Password reset Successfuly"
        })

    } catch (error) {
        console.log("something went wrong while reset password", error)
        res.status(403).json({
            success: false,
            message: "something went wrong while reset password ",
        })
    }
};