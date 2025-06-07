import { initTaskDashboard } from "./taskDashboard.js";
import { initHabitDashboard } from "./habitDashboard.js";

document.addEventListener("DOMContentLoaded", () => {
  const toggleTask = document.getElementById("toggle-task");
  const toggleHabit = document.getElementById("toggle-habit");
  const taskForm = document.getElementById("task-form");
  const habitForm = document.getElementById("habit-form");

  toggleTask.addEventListener("click", () => {
    toggleTask.classList.add("active");
    toggleHabit.classList.remove("active");
    taskForm.style.display = "block";
    habitForm.style.display = "none";
  });

  toggleHabit.addEventListener("click", () => {
    toggleHabit.classList.add("active");
    toggleTask.classList.remove("active");
    taskForm.style.display = "none";
    habitForm.style.display = "block";
  });

  initTaskDashboard();
  initHabitDashboard();

  // Initialize the toggle
  document.getElementById("email-toggle").addEventListener("change", function () {
      const enabled = this.checked;

      fetch("/api/users/emailReminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailReminders: enabled }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Email reminder setting updated:", data))
        .catch((err) => console.error("Error updating email reminders:", err));
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });

  // Delete account
  document.getElementById("deleteAccountBtn").addEventListener("click", () => {
    const confirmDelete = confirm(
      "⚠️ WARNING: This will permanently delete your account and all data. Continue?"
    );

    if (confirmDelete) {
      fetch("/api/users/deleteAccount", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            alert("Account deleted. Redirecting to Home page...");
            console.log("Redirecting to:", window.location.href);
            window.location.href = "../index.html"; // Redirect after deletion
          } else {
            alert("Failed to delete account. Please try again.");
          }
        })
        .catch((err) => console.error("Error:", err));
    }
  });
});
