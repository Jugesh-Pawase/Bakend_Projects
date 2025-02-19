const mongoose = require("mongoose");//import mongoose

require("dotenv").config();//load content of dotenv file in process object

const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL, {
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

module.exports.connect = dbConnect;


//Concludion:Connect application with database(mongodb).