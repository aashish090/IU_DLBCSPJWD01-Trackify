export function initHabitDashboard() {
  const habitForm = document.getElementById("habit-form");
  const habitName = document.getElementById("habit-name");
  const habitTime = document.getElementById("habit-time");
  const habitFrequency = document.getElementById("habit-frequency");
  const habitList = document.getElementById("habit-list");

  // Create new habit
  habitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newHabit = {
      title: habitName.value.trim(),
      time: habitTime.value,
      frequency: habitFrequency.value,
    };

    fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newHabit),
    })
      .then((res) => res.json())
      .then(() => {
        loadHabits();
        habitForm.reset();
      })
      .catch((err) => console.error("Error creating habit:", err));
  });

  loadHabits();

  // Render habit to UI
  function renderHabit(habit) {
    const div = document.createElement("div");
    div.className = "habit-card";

    const title = document.createElement("h3");
    title.textContent = habit.title;

    const info = document.createElement("p");
    info.textContent = `Frequency: ${habit.frequency}, Time: ${
      habit.time || "Not set"
    }`;

    const streak = document.createElement("p");
    streak.textContent = `Streak: ${habit.streak || 0}`;

    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "habit-buttons";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Completed";
    completeBtn.onclick = () => completeHabit(habit._id);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editHabit(habit);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteHabit(habit._id, div);

    buttonContainer.append(completeBtn, editBtn, deleteBtn);

    div.appendChild(title);
    div.appendChild(info);
    div.appendChild(streak);
    div.appendChild(buttonContainer);
    habitList.appendChild(div);
  }

  // Complete habit
  function completeHabit(id) {
    fetch(`/api/habits/complete/${id}`, { method: "PATCH" })
      .then((res) => res.json())
      .then(() => loadHabits())
      .catch((err) => console.error("Error completing habit:", err));
  }

  // Edit habit
  function editHabit(habit) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
    <div class="modal">
      <h2>Edit Habit</h2>
      <input type="text" id="edit-habit-title" value="${
        habit.title
      }" placeholder="Title" />
      <input type="time" id="edit-habit-time" value="${
        habit.time || ""
      }" placeholder="Time" />

      <select id="edit-habit-frequency">
        <option value="daily" ${
          habit.frequency === "daily" ? "selected" : ""
        }>Daily</option>
        <option value="every 2 days" ${
          habit.frequency === "every 2 days" ? "selected" : ""
        }>Every 2 days</option>
        <option value="evry 3 days" ${
          habit.frequency === "every 3 days" ? "selected" : ""
        }>Every 3 days</option>
        <option value="weekly" ${
          habit.frequency === "weekly" ? "selected" : ""
        }>Weekly</option>
        <option value="monthly" ${
          habit.frequency === "monthly" ? "selected" : ""
        }>Monthly</option>
      </select>

      <button id="save-habit-edit">Save</button>
      <button id="cancel-habit-edit">Cancel</button>
    </div>
  `;
    document.body.appendChild(modal);

    document
      .getElementById("cancel-habit-edit")
      .addEventListener("click", () => modal.remove());

    document.getElementById("save-habit-edit").addEventListener("click", () => {
      const updatedTitle = document
        .getElementById("edit-habit-title")
        .value.trim();
      const updatedTime = document.getElementById("edit-habit-time").value;
      const updatedFrequency = document.getElementById(
        "edit-habit-frequency"
      ).value;

      if (!updatedTitle || !updatedFrequency) {
        alert("Title and frequency are required.");
        return;
      }

      fetch(`/api/habits/${habit._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle,
          time: updatedTime,
          frequency: updatedFrequency,
        }),
      })
        .then((res) => res.json())
        .then(() => {
          modal.remove();
          loadHabits();
        })
        .catch((err) => console.error("Error updating habit:", err));
    });
  }

  // Delete habit
  function deleteHabit(id, cardElement) {
    const confirmDelete = confirm("Delete this habit?");
    if (!confirmDelete) return;

    fetch(`/api/habits/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        cardElement.remove();
        loadHabits();
      })
      .catch((err) => console.error("Error deleting habit:", err));
  }

  // Load habit
  function loadHabits() {
    fetch("/api/habits/me")
      .then((res) => res.json())
      .then((data) => {
        habitList.innerHTML = "";

        // Remove old empty message if present
        const oldMessage = document.querySelector(".habit-empty-message");
        if (oldMessage) oldMessage.remove();

        if (!Array.isArray(data) || data.length === 0) {
          const msg = document.createElement("div");
          msg.className = "empty-message habit-empty-message";
          msg.innerHTML = `
          <p>No habits yet 🌱</p>
          <p>Start one today and build your streaks!</p>
        `;
          habitList.appendChild(msg);
          return;
        }

        data.forEach(renderHabit);
      });
  }
}
