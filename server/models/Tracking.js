const mongoose = require("mongoose");

const TrackingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    website: String,
    timeSpent: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Tracking", TrackingSchema);