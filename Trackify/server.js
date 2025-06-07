const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");
const habitRoutes = require("./routes/habit");

const app = express();

app.use(cors({
  origin: 'http://LocalHost:3000', // Your frontend URL
  credentials: true 
}));
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    }
  })
);

// API routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/habits", habitRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// 404 handler
app.use((req, res) => {
  res.status(404).send("Not found, buddy.");
});


// MongoDB connection 
mongoose
.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection failed:", err));

// Start Reminder Scheduler
require("./utils/reminderScheduler");

// Start server
const PORT = 3000;
const HOST = "0.0.0.0";
app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
