const express = require("express");
const app = express();

//Load config from env file
require("dotenv").config();
const PORT = process.env.PORT || 4000;

const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());

require("./config/database").connect();

//import route and mount
const user = require("./routes/user");
app.use("/api/v1", user);

//start server
app.listen(PORT, () => {
    console.log(`Server started successfully at ${PORT}`);
})