const Tracking = require("../models/Tracking");
const User = require("../models/User")

const trackWebsite = async (req, res) => {
    try {
        const { userId, website, timeSpent } = req.body;

        let trackingEntry = await Tracking.findOne({ userId, website });

        if (trackingEntry) {
            trackingEntry.timeSpent += timeSpent;
            await trackingEntry.save();
        } else {
            trackingEntry = new Tracking({ userId, website, timeSpent });
            await trackingEntry.save();
        }

        res.json({ msg: "Time Tracked successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getDailyReport = async (req, res) => {
    try {
        const { userId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const user = await User.findById(userId);
        if (!user) {
            res.json({ msg: "Invalid User ID" });
        }
        const report = await Tracking.find({ userId, date: { $gte: today } });

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteWebsiteRecord = async (req, res) => {
    try {
        const { userId, website } = req.body;
        let trackingEntry = await Tracking.findOneAndDelete({ userId, website });
        if(trackingEntry){
            res.status(200).json({ msg: "Website record deleted" });
        }
        else{
            res.status(500).json({ msg: "Something went wrong. Please try again" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { trackWebsite, getDailyReport, deleteWebsiteRecord };
