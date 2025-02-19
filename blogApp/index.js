const express = require("express");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 4000;

//Middleware
app.use(express.json());

const blog = require("./routes/blog");
app.use("/api/v1", blog);

const connectWithDb = require("./config/database");
connectWithDb();

//start the server
app.listen(PORT, () => {
    console.log(`Server started successfully at port no ${PORT}`);
})

app.get("/", (req, res) => {
    res.send("<h1>This is My Homepage</h1>");
})