//http:Hyper Text Transfer Protocall
//get:use to receive some data
//put: Use to update data
//post: Use to submit some data
//delete: Use to rmeove some data

//Create folder
//Open terminal in folder
//Go to terminal in FIRSTAPP directory and type npm init -y to get package.json & package-lock.json file
//to get express(node_module folder) type: npm i express
//Create index.js file

const express = require("express"); //import express frameWork
const app = express(); //use express frameWork to build/create backend application
const port = 3000; //adress

//App get started
app.listen(port, () => {
    console.log("App started");
})    //to see output type: node index.js

//adding middelware
app.use(express.json());

const bodyParser = require("body-parser");
app.use(bodyParser.json());

//Basic Routing //get repuest
app.get("/", (request, response) => {
    response.send(`<h1>This is Heading</h1>`);
})

//Mounting
app.get("/jug", (req, res) => {
    res.send(`<h1>This is Mounting</h1>`);
})

//Basic Routing //post repuest
app.post("/jugesh", (req, res) => {    //download postman
    const { name, brand } = req.body;
    console.log(name);
    console.log(brand);
    res.send(`Car Submitted Successfully.`);
})

//to get nodemon type on terminal: npm i nodemon   //update script text in package.json()
//tyoe on terminal: npm run dev or nodemon index.js    to check installation
//nodemon:Keep server in running state  //so dont need of restart applicaton
app.get("/j", (req, res) => {
    res.send(`<h1>This is </h1>`);
})

//Object Data Modeling(ODM)//e.g Monguse, abstract information between node-js and mongodb

//MDCV:Software architecture pattern use to place diffrent type of files in diffrent folders
//Optimal folder structure(http request->Routs->controller->Module->DB)

//After download mongodb type on terminal: ./mongodb   mongosh   npm i mongoose
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/firstApp', {
    //useNewurlParser: true,
    //useUnifiedTopology:true
})
    .then(() => { console.log("Connection Successful") })
    .catch((error) => { console.log("Received an error") })