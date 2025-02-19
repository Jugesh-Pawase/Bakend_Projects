const express = require("express");
const app = express();

//Load config from env file
require("dotenv").config();
const PORT = process.env.PORT || 4000;

//Middleware to parse json request body  or 
//Middleware to read and convert the incoming JSON-formatted data from a request body into a JavaScript
//object format that can be easily accessed and manipulated within the server - side code.
app.use(express.json());

//import routs for TODO API
const todoRoutes = require("./routes/todos");

//Mount the node API routs
app.use("/api/v1", todoRoutes);

//start server
app.listen(PORT, () => {
    console.log(`Server started successfully at ${PORT}`);
})

//connect application to the database(e.g mongodb)
const dbConnect = require("./config/database");
dbConnect();

//default Rout
app.get("/", (req, res) => {
    res.send('<h1>This is HOMEPAGE</h1>');
})