const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const trackingRoutes = require("./routes/trackingRoutes");


const app = express();
app.use(express.json());
app.use(cors())

app.get("/", (req, res) =>{
    res.json("Productivity Tracker's backend Running Smoothly");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tracking", trackingRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongodb connected")
    ).catch((err) => console.log(err))

const port = 5000;
app.listen(port, () => console.log(`Server running on ${port}`))