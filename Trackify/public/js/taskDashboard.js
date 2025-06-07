export function initTaskDashboard() {
  const taskForm = document.getElementById("task-form");
  const titleInput = document.getElementById("title");
  const deadlineInput = document.getElementById("deadlineInput");
  const taskList = document.getElementById("taskList");

  // Render task
  function renderTask(task) {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-item");

    const title = document.createElement("h3");
    title.textContent = task.title;
    title.style.fontWeight = "bold";
    title.style.fontSize = "1.1rem";

    const due = document.createElement("p");
    const dueDate = new Date(task.dueDate).toLocaleString();
    due.textContent = `Due: ${dueDate}`;
    due.style.color = "#555";
    due.style.fontSize = "0.9rem";

    // Checkbox with label
    const completeContainer = document.createElement("div");
    completeContainer.classList.add("complete-container");

    const completed = document.createElement("input");
    completed.type = "checkbox";
    completed.checked = task.completed;
    completed.classList.add("task-checkbox");
    completed.dataset.taskId = task._id;

    const label = document.createElement("label");
    label.textContent = "Mark Completed";
    label.classList.add("complete-label");
    label.htmlFor = `complete-${task._id}`;
    completed.id = `complete-${task._id}`;

    completeContainer.append(completed, label);

    // Buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "task-buttons";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => openEditTaskModal(task));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", (e) =>
      deleteTask(task._id, e.target)
    );

    buttonContainer.append(editButton, deleteButton);

    taskCard.append(title, due, completeContainer, buttonContainer);
    taskList.appendChild(taskCard);
  }

  function toggleTaskStatus(taskId) {
    fetch(`/api/tasks/${taskId}/toggle`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then(() => {
        console.log(`Task ${taskId} status toggled.`);
      })
      .catch((err) => console.error("Error toggling task status:", err));
  }

  // Edit task
  function openEditTaskModal(task) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
    <div class="modal">
      <h2>Edit Task</h2>
      <input type="text" id="edit-title" value="${task.title}" />
      <input type="datetime-local" id="edit-deadline" value="${new Date(
        task.dueDate
      )
        .toISOString()
        .slice(0, 16)}" />
      <button id="save-edit">Save</button>
      <button id="cancel-edit">Cancel</button>
    </div>
  `;
    document.body.appendChild(modal);

    document
      .getElementById("cancel-edit")
      .addEventListener("click", () => modal.remove());

    document.getElementById("save-edit").addEventListener("click", () => {
      const updatedTitle = document.getElementById("edit-title").value.trim();
      const updatedDeadline = document.getElementById("edit-deadline").value;

      if (!updatedTitle || !updatedDeadline) {
        alert("Title and deadline are required.");
        return;
      }

      fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: updatedTitle, dueDate: updatedDeadline }),
      })
        .then((res) => res.json())
        .then(() => {
          modal.remove();
          loadTasks(); // Refresh tasks list
        })
        .catch((err) => console.error("Error updating task:", err));
    });
  }

  //Load task
  function loadTasks() {
    fetch("/api/tasks")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/login.html";
          return;
        }
        return res.json();
      })
      .then((tasks) => {
        taskList.innerHTML = "";

        // Remove old empty message if present
        const oldMessage = document.querySelector(".task-empty-message");
        if (oldMessage) oldMessage.remove();

        if (!tasks || tasks.length === 0) {
          const msg = document.createElement("div");
          msg.className = "empty-message task-empty-message";
          msg.innerHTML = `
          <p>No tasks found ✨</p>
          <p>Create a task above to start tracking your productivity!</p>
        `;
          taskList.appendChild(msg);
          return;
        }

        tasks.forEach(renderTask);
        bindTaskCheckboxEvents();
      })
      .catch((err) => console.error("Fetch error:", err));
  }

  function bindTaskCheckboxEvents() {
    const checkboxes = document.querySelectorAll(".task-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const taskId = checkbox.dataset.taskId;
        toggleTaskStatus(taskId);
      });
    });
  }

  // Delete task
  function deleteTask(id, btn) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    fetch(`/api/tasks/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        const taskCard = btn.closest(".task-item");
        if (taskCard) taskCard.remove();
        loadTasks();
      })
      .catch((err) => console.error("Error deleting task:", err));
  }

  // Initial load
  loadTasks();

  // Create new task
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const deadline = deadlineInput.value;

    if (!title || !deadline) {
      alert("Please enter both a task title and a deadline.");
      return;
    }

    const taskData = { title, dueDate: deadline };

    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.task) {
          loadTasks();
          titleInput.value = "";
          deadlineInput.value = "";
        }
      })
      .catch((err) => console.error("Error adding task:", err));
  });
}
