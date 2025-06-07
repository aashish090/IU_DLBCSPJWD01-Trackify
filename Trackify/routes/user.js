const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, toggleEmailReminders, deleteAccount } = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/emailReminders", toggleEmailReminders);
router.post('/logout', logoutUser);
router.delete("/deleteAccount",authenticate, deleteAccount);

module.exports = router;
