const User = require("../models/user");
const Task = require("../models/task");
const Habit = require("../models/habit");
const bcrypt = require("bcryptjs");

// REGISTER
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required." });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: `User ${name} registered successfully!` });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required." });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    req.session.userId = user._id;

    res.status(200).json({ message: "Login successful!", userId: user._id });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// EMAIL REMINDER
exports.toggleEmailReminders = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    user.emailReminders = req.body.emailReminders;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update reminder settings." });
  }
};


// LOGOUT
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
};

// DELETE ACCOUNT
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    await Promise.all([
      Task.deleteMany({ userId: userId }),
      Habit.deleteMany({ userId: userId }),
      User.findByIdAndDelete(userId)
    ]);

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Failed to destroy session." });
      }
      res.clearCookie("connect.sid"); 
      res.status(200).json({ success: true });
    });
  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).json({ error: "Failed to delete account." });
  }
};