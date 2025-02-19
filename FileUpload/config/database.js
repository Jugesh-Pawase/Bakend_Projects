const mongoose = require("mongoose");//import mongoose

//on terminal type: npm i dotenv

require("dotenv").config();//load content of dotenv file in process object

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
      //  useNewUrlParser: true,
      //  useUnifiedTopology: true,
    })
        .then(() => console.log("DB ka Connection is successfull"))
        .catch((error) => {
            console.log("Issue in DB Connection");
            console.error(error.message);
            process.exit(1);
        });
}