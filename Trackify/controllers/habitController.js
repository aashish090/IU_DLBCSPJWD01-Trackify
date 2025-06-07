const Habit = require("../models/habit");

exports.createHabit = async (req, res) => {
  try {
    const { title, frequency, time } = req.body;
    const userId = req.session.userId;

    if (!title || !frequency) {
      return res
        .status(400)
        .json({ message: "Title and frequency are required" });
    }

    const newHabit = new Habit({
      title,
      frequency,
      time,
      userId,
    });

    await newHabit.save();
    res
      .status(201)
      .json({ message: "Habit created successfully", habit: newHabit });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getUserHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.session.userId });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const incomingTime = req.body.time;
    const timeChanged = incomingTime && incomingTime !== habit.time;

    // Apply updates
    habit.title = req.body.title ?? habit.title;
    habit.description = req.body.description ?? habit.description;
    habit.time = incomingTime ?? habit.time;

    if (timeChanged) {
      habit.lastReminderDate = null; // Reset so reminder can trigger again
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteHabit = async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const now = new Date();
    const last = habit.lastCompleted ? new Date(habit.lastCompleted) : null;

    const diffInDays = last
      ? Math.floor((now - last) / (1000 * 60 * 60 * 24))
      : Infinity;

    let valid = false;
    switch (habit.frequency) {
      case "daily":
        valid = diffInDays >= 1;
        break;
      case "every 2 days":
        valid = diffInDays >= 2;
        break;
      case "every 3 days":
        valid = diffInDays >= 3;
        break;
      case "weekly":
        valid = diffInDays >= 7;
        break;
      case "monthly":
        valid = diffInDays >= 30;
        break;
    }

    habit.streak = valid ? habit.streak + 1 : 1;
    habit.lastCompleted = now;

    await habit.save();
    res.status(200).json({ message: "Habit marked complete", habit });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};
