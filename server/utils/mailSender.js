const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        //transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        //send mail
        let info = await transporter.sendMail({
            from: "studyNotion || Clashgyan - by Jugesh",
            to:`${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        console.log("INFO", info);
        return info;
    }
    catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;