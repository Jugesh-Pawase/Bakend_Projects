const mongoose = require("mongoose");//import mongoose

require("dotenv").config();//load content of dotenv file in process object

exports.Connect = () => {
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
};

//Concludion:Connect application with database(mongodb).