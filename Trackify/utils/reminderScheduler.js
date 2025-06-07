const cron = require("node-cron");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Task = require("../models/task");
const Habit = require("../models/habit");
require("dotenv").config();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send Reminder
function sendEmailReminder(userEmail, message) {
  return transporter.sendMail({
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Reminder",
    text: message,
  });
}

// Cron job
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // === TASK REMINDERS ===
    const tasksDueSoon = await Task.find({
      dueDate: { $gte: now, $lte: oneHourLater },
      reminderSent: false,
    }).populate("userId");

    for (const task of tasksDueSoon) {
      const user = await User.findById(task.userId);
      if (user && user.emailReminders) {
        // Calculate exact time remaining
        const timeRemaining = Math.max(0, task.dueDate - now);
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
        );

        // Format the time string
        let timeString = "";
        if (hours > 0) timeString += `${hours} hour${hours !== 1 ? "s" : ""}`;
        if (minutes > 0) {
          if (hours > 0) timeString += " and ";
          timeString += `${minutes} minute${minutes !== 1 ? "s" : ""}`;
        }

        await sendEmailReminder(
          user.email,
          `⏰ Task "${task.title}" is due in ${
            timeString || "less than a minute"
          }.`
        );
        task.reminderSent = true;
        await task.save();
      }
    }

    // === HABIT REMINDERS ===
    const habits = await Habit.find({}).populate("userId");
    const currentIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    for (const habit of habits) {
      const user = await User.findById(habit.userId);
      if (user && user.emailReminders && habit.time) {
        const [habitHours, habitMinutes] = habit.time.split(":").map(Number);
        const habitTimeToday = new Date(currentIST);
        habitTimeToday.setHours(habitHours, habitMinutes, 0, 0);

        // Check if already reminded today
        const lastReminderDate = habit.lastReminderDate;
        const sameDay =
          lastReminderDate &&
          lastReminderDate.getDate() === currentIST.getDate() &&
          lastReminderDate.getMonth() === currentIST.getMonth() &&
          lastReminderDate.getFullYear() === currentIST.getFullYear();

        // Calculate time until habit
        const timeUntilHabit = habitTimeToday - currentIST;

        if (
          !sameDay &&
          timeUntilHabit > 0 &&
          timeUntilHabit <= 60 * 60 * 1000
        ) {
          const habitHoursRemaining = Math.floor(
            timeUntilHabit / (1000 * 60 * 60)
          );
          const habitMinutesRemaining = Math.floor(
            (timeUntilHabit % (1000 * 60 * 60)) / (1000 * 60)
          );

          let habitTimeString = "";
          if (habitHoursRemaining > 0)
            habitTimeString += `${habitHoursRemaining} hour${
              habitHoursRemaining !== 1 ? "s" : ""
            }`;
          if (habitMinutesRemaining > 0) {
            if (habitHoursRemaining > 0) habitTimeString += " and ";
            habitTimeString += `${habitMinutesRemaining} minute${
              habitMinutesRemaining !== 1 ? "s" : ""
            }`;
          }

          await sendEmailReminder(
            user.email,
            `🌿 Habit "${habit.title}" is scheduled in ${
              habitTimeString || "less than a minute"
            }.`
          );

          // Save reminder timestamp
          habit.lastReminderDate = currentIST;
          await habit.save();
        }
      }
    }
  } catch (err) {
    console.error("[CRON JOB ERROR]:", err);
  }
});
