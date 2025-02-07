const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: "User with that email already exits" });
        }
        if (!name || !email || !password){
            return res.status(400).json({ msg: "Please enter all details" });
        }
        if (password.length < 8) {
            return res.status(400).json({ msg: "Password should be longer than 8 characters" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new User({
            name, email, password: hashedPassword, blockedSites: [], dailyReports: []
        })

        await newUser.save();
        
        const accessToken = createAccessToken({ id: newUser._id });
            const refreshToken = createRefreshToken({ id: newUser._id });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh-token',
                sameSite: 'None', // Ensure the cookie is sent only to your domain
                secure: process.env.NODE_ENV === 'production' // Ensure cookie is sent only over HTTPS in production
            });


            res.json({ accessToken });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: "User does not exist with that email" });
        }

        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Password is incorrect" });
        }

        const accessToken = createAccessToken({ id: user._id });
        const refreshToken = createRefreshToken({ id: user._id });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/user/refresh-token',
            sameSite: 'None',
            secure: process.env.NODE_ENV === 'production'
        });

        // ✅ FIX: Return user details along with the token
        res.json({
            accessToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                blockedSites: user.blockedSites
            }
        });

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const rf_token = req.cookies.refreshToken;

        if (!rf_token) {
            return res.status(400).json({ msg: "Please register or login" });
        }

        jwt.verify(rf_token, process.env.REFRESH_TOKEN, (error, user) => {
            if (error) {
                return res.status(400).json({ msg: "Please register or login" });
            }

            const accessToken = createAccessToken({ id: user.id });
            res.json({ accessToken });
        });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}
// Get user preferences (Blocked Sites)
const getUserPreferences = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.json({ blockedSites: user.blockedSites });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  // Update user preferences (Blocked Sites)
const updateUserPreferences = async (req, res) => {
    try {
      const { blockedSites } = req.body;
      const user = await User.findByIdAndUpdate(req.params.userId, { blockedSites }, { new: true });
  
      res.json({ message: "Preferences updated", blockedSites: user.blockedSites });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
}
const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '7d' })
}


module.exports = {registerUser, loginUser, refreshToken, getUserPreferences, updateUserPreferences};