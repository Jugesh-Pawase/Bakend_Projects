const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const OTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required:true,
        },
        createAt: {
            type: Date,
            default: Date.now(),
            expires:5*60*1000,
        },
    }
);

//Function to send email
async function sendverificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification email from StudyNotion", otp);
        console.log("Email send successfully", mailResponse);
    }
    catch (error) {
        console.log("Error occure while sending email", error);
        throw error;
    }
}

OTPSchema.pre("save", async function (next){
    await sendverificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", OTPSchema);