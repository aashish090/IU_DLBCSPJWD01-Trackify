const Task = require("../models/task");

exports.createTask = async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    const task = new Task({
      userId: req.session.userId,
      title,
      dueDate: new Date(dueDate),
    });

    await task.save();
    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Error creating task", error });
  }
};

exports.toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    task.completed = !task.completed;
    await task.save();
    res.json({ message: "Task status updated", task });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle task status" });
  }
};


exports.getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.session.userId }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const incomingData = req.body;

    const existingTask = await Task.findOne({ _id: id, userId: req.session.userId });
    if (!existingTask) return res.status(404).json({ message: "Task not found" });

    const newDueDate = new Date(incomingData.dueDate);
    const oldDueDate = new Date(existingTask.dueDate);

    // Compare times
    const dueDateChanged = newDueDate.getTime() !== oldDueDate.getTime();

    // Apply changes
    existingTask.title = incomingData.title ?? existingTask.title;
    existingTask.dueDate = newDueDate;

    if (dueDateChanged) {
      existingTask.reminderSent = false;
    }

    await existingTask.save();
    res.json({ message: "Task updated", updatedTask: existingTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findOneAndDelete({ _id: id, userId: req.session.userId });

    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
};
