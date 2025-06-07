const express = require("express");
const router = express.Router();
const {
  createTask,
  getUserTasks,
  updateTask,
  deleteTask,
  toggleTaskCompletion
} = require("../controllers/taskController");

const authenticate = require('../middleware/authMiddleware');


router.post("/", authenticate, createTask);          // Create task
router.get("/", authenticate, getUserTasks);         // Get all user tasks
router.patch("/:id", authenticate, updateTask);      // Update task
router.delete("/:id", authenticate, deleteTask);     // Delete task
router.patch("/:id/toggle", authenticate, toggleTaskCompletion);   //Toggle task completion


module.exports = router;
