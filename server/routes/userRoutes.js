const express = require("express");

const {registerUser, loginUser, getUserPreferences, updateUserPreferences} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/get-user-preferences/:userId", getUserPreferences);
router.put("/update-user-preferences/:userId", updateUserPreferences)

module.exports = router;