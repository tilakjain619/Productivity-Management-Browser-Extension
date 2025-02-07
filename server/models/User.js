const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    blockedSites: [String],
    dailyReports: Array
})

module.exports = mongoose.model("User", userSchema);