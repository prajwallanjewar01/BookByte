import { storage } from "./storage.js";

// =========================================
// STORAGE KEYS
// =========================================
const TASKS_KEY = "tasks";
const GOALS_KEY = "dailyGoalsList";

// =========================================
// STATE & SANITIZATION
// =========================================
// Sanitize tasks on load to ensure every item has a resolvable ID
let tasks = (storage.get(TASKS_KEY, []) || []).map((task, idx) => ({
  id: task && task.id ? task.id : Date.now() + idx,
  text: task && typeof task.text === "string" ? task.text : "",
  completed: Boolean(task && task.completed),
  createdAt: task && task.createdAt ? task.createdAt : new Date().toISOString()
}));

let goals = (storage.get(GOALS_KEY, []) || []).map((goal, idx) => ({
  id: goal && goal.id ? goal.id : Date.now() + idx,
  text: goal && typeof goal.text === "string" ? goal.text : "",
  createdAt: goal && goal.createdAt ? goal.createdAt : new Date().toISOString()
}));

// =========================================
// DOM ELEMENTS
// =========================================
const taskList = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task");
const taskInput = document.getElementById("task-input");

const goalInput = document.getElementById("goal-input");
const saveGoalBtn = document.getElementById("save-goal");
const goalDisplay = document.getElementById("goal-display");

// =========================================
// DRAG-AND-DROP STATE
// =========================================
let draggedTaskIndex = null;
let draggedGoalIndex = null;

// =========================================
// INITIALIZATION
// =========================================
export function initTasks() {
  if (!taskList || !addTaskBtn || !taskInput) {
    console.error("❌ Task module elements missing");
    return;
  }

  renderTasks();
  renderGoalsList();

  // Primary Button Triggers
  addTaskBtn.addEventListener("click", addTask);

  if (saveGoalBtn) {
    saveGoalBtn.addEventListener("click", saveGoal);
  }

  // Keyboard Submissions (Preventing double-trigger anomalies)
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  });

  if (goalInput) {
    goalInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveGoal();
      }
    });
  }

  // Event Delegation Routers
  taskList.addEventListener("click", handleTaskActions);

  if (goalDisplay) {
    goalDisplay.addEventListener("click", handleGoalActions);
  }

  console.log("✅ Tasks & Goals Module Ready");
}

// =========================================
// TASK MANAGEMENT
// =========================================
function addTask() {
  const rawValue = taskInput.value || "";
  const trimmedValue = rawValue.trim();

  // Strict check: rejects empty strings, single spaces, double spaces, and pure whitespace
  if (!trimmedValue || !/\S/.test(trimmedValue)) {
    alert("Please enter a valid task name (spaces alone are not allowed).");
    taskInput.value = "";
    taskInput.focus();
    return;
  }

  const newTask = {
    id: Date.now(),
    text: trimmedValue,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (!tasks.length) {
    taskList.innerHTML = `
      <div class="card">
        <p>No tasks added yet.</p>
      </div>
    `;
    return;
  }

  tasks.forEach((task, index) => {
    const item = document.createElement("div");
    item.className = "task-item";
    item.draggable = true;
    item.dataset.index = index;

    // Render placeholder if task is unnamed so delete controls remain visible and functional
    const displayText = task.text && task.text.trim()
      ? escapeHTML(task.text)
      : `<em style="opacity: 0.6; font-style: italic;">(Untitled Task)</em>`;

    item.innerHTML = `
      <div class="task-drag-handle" title="Drag to reorder">☰</div>

      <div class="task-left-checkbox">
        <input
          type="checkbox"
          data-action="toggle"
          data-id="${task.id}"
          ${task.completed ? "checked" : ""}
          aria-label="Mark task as complete"
        />
      </div>

      <div class="task-text-container">
        <span class="task-text ${task.completed ? "completed" : ""}">
          ${displayText}
        </span>
      </div>

      <div class="task-actions">
        <button
          data-action="edit"
          data-id="${task.id}"
          title="Edit"
          aria-label="Edit task"
        >
          ✏️
        </button>
        <button
          data-action="delete"
          data-id="${task.id}"
          title="Delete"
          aria-label="Delete task"
        >
          ❌
        </button>
      </div>
    `;

    // Desktop Drag-and-Drop
    item.addEventListener("dragstart", () => {
      draggedTaskIndex = index;
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      draggedTaskIndex = null;
    });

    item.addEventListener("dragover", (e) => e.preventDefault());

    item.addEventListener("drop", () => {
      moveTask(draggedTaskIndex, index);
    });

    // Mobile Touch Drag-and-Drop
    const handle = item.querySelector(".task-drag-handle");
    if (handle) {
      handle.addEventListener("touchstart", (e) => {
        draggedTaskIndex = index;
        item.classList.add("dragging");
        e.stopPropagation();
      }, { passive: true });

      handle.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const closestItem = targetElement?.closest(".task-item");

        if (closestItem && closestItem !== item && !closestItem.classList.contains("goal-item")) {
          const targetIndex = Number(closestItem.dataset.index);
          if (!isNaN(targetIndex) && targetIndex !== draggedTaskIndex) {
            moveTask(draggedTaskIndex, targetIndex);
            draggedTaskIndex = targetIndex;
          }
        }
      }, { passive: false });

      handle.addEventListener("touchend", () => {
        item.classList.remove("dragging");
        draggedTaskIndex = null;
      });
    }

    taskList.appendChild(item);
  });
}

function handleTaskActions(event) {
  // Checkbox toggle
  const checkbox = event.target.closest('input[data-action="toggle"]');
  if (checkbox) {
    const id = checkbox.dataset.id;
    const item = checkbox.closest(".task-item");
    const index = item ? Number(item.dataset.index) : -1;
    toggleTask(id, index);
    return;
  }

  // Button actions
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  const item = button.closest(".task-item");
  const index = item ? Number(item.dataset.index) : -1;

  if (action === "delete") {
    deleteTask(id, index);
  } else if (action === "edit") {
    editTask(id, index);
  }
}

function deleteTask(id, index) {
  let targetIndex = -1;

  // Primary: Match by ID using string comparison to bridge string/numeric IDs safely
  if (id !== undefined && id !== null && id !== "" && id !== "undefined") {
    targetIndex = tasks.findIndex((task) => String(task.id) === String(id));
  }

  // Secondary Fallback: Match by DOM dataset index if ID is absent or corrupted
  if (targetIndex === -1 && typeof index === "number" && index >= 0 && index < tasks.length) {
    targetIndex = index;
  }

  if (targetIndex !== -1) {
    tasks.splice(targetIndex, 1);
    saveTasks();
    renderTasks();
  }
}

function toggleTask(id, index) {
  let targetIndex = -1;

  if (id !== undefined && id !== null && id !== "" && id !== "undefined") {
    targetIndex = tasks.findIndex((task) => String(task.id) === String(id));
  }

  if (targetIndex === -1 && typeof index === "number" && index >= 0 && index < tasks.length) {
    targetIndex = index;
  }

  if (targetIndex !== -1) {
    tasks[targetIndex].completed = !tasks[targetIndex].completed;
    saveTasks();
    renderTasks();
  }
}

function editTask(id, index) {
  let targetIndex = -1;

  if (id !== undefined && id !== null && id !== "" && id !== "undefined") {
    targetIndex = tasks.findIndex((task) => String(task.id) === String(id));
  }

  if (targetIndex === -1 && typeof index === "number" && index >= 0 && index < tasks.length) {
    targetIndex = index;
  }

  if (targetIndex === -1) return;

  const task = tasks[targetIndex];
  const updatedText = prompt("Edit task:", task.text || "");
  if (updatedText === null) return;

  const trimmed = updatedText.trim();
  if (!trimmed || !/\S/.test(trimmed)) {
    alert("Task cannot be empty or only spaces.");
    return;
  }

  task.text = trimmed;
  saveTasks();
  renderTasks();
}

function moveTask(fromIndex, toIndex) {
  if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
  const [moved] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, moved);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  storage.set(TASKS_KEY, tasks);
}

// =========================================
// GOAL MANAGEMENT
// =========================================
function saveGoal() {
  const rawValue = goalInput.value || "";
  const trimmedValue = rawValue.trim();

  if (!trimmedValue || !/\S/.test(trimmedValue)) {
    alert("Please enter a valid goal (spaces alone are not allowed).");
    goalInput.value = "";
    goalInput.focus();
    return;
  }

  const newGoal = {
    id: Date.now(),
    text: trimmedValue,
    createdAt: new Date().toISOString()
  };

  goals.unshift(newGoal);
  persistGoalsToStorage();
  renderGoalsList();

  goalInput.value = "";
  goalInput.focus();
}

function renderGoalsList() {
  if (!goalDisplay) return;
  goalDisplay.innerHTML = "";

  if (!goals.length) {
    goalDisplay.innerHTML = `
      <div class="card" style="box-shadow: none; background: transparent; border: none; padding: 0;">
        <p style="margin: 0; color: var(--text-muted);">No daily goals set yet.</p>
      </div>
    `;
    return;
  }

  goals.forEach((goal, index) => {
    const goalItem = document.createElement("div");
    goalItem.className = "task-item goal-item";
    goalItem.draggable = true;
    goalItem.dataset.index = index;

    const displayText = goal.text && goal.text.trim()
      ? escapeHTML(goal.text)
      : `<em style="opacity: 0.6; font-style: italic;">(Untitled Goal)</em>`;

    goalItem.innerHTML = `
      <div class="task-drag-handle" title="Drag to reorder">☰</div>

      <div class="task-text-container" style="padding-left: 8px;">
        <span class="task-text">🎯 ${displayText}</span>
      </div>

      <div class="task-actions">
        <button
          data-goal-action="edit"
          data-id="${goal.id}"
          title="Edit Goal"
          aria-label="Edit goal"
        >
          ✏️
        </button>
        <button
          data-goal-action="delete"
          data-id="${goal.id}"
          title="Delete Goal"
          aria-label="Delete goal"
        >
          ❌
        </button>
      </div>
    `;

    // Desktop Drag-and-Drop
    goalItem.addEventListener("dragstart", () => {
      draggedGoalIndex = index;
      goalItem.classList.add("dragging");
    });

    goalItem.addEventListener("dragend", () => {
      goalItem.classList.remove("dragging");
      draggedGoalIndex = null;
    });

    goalItem.addEventListener("dragover", (e) => e.preventDefault());

    goalItem.addEventListener("drop", () => {
      if (draggedGoalIndex !== null && draggedGoalIndex !== index) {
        const [movedGoal] = goals.splice(draggedGoalIndex, 1);
        goals.splice(index, 0, movedGoal);
        persistGoalsToStorage();
        renderGoalsList();
      }
    });

    // Mobile Touch Drag-and-Drop
    const touchHandle = goalItem.querySelector(".task-drag-handle");
    if (touchHandle) {
      touchHandle.addEventListener("touchstart", (e) => {
        draggedGoalIndex = index;
        goalItem.classList.add("dragging");
        e.stopPropagation();
      }, { passive: true });

      touchHandle.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const closestGoal = targetElement?.closest(".goal-item");

        if (closestGoal && closestGoal !== goalItem) {
          const targetIndex = Number(closestGoal.dataset.index);
          if (!isNaN(targetIndex) && targetIndex !== draggedGoalIndex) {
            const [movedGoal] = goals.splice(draggedGoalIndex, 1);
            goals.splice(targetIndex, 0, movedGoal);
            persistGoalsToStorage();
            renderGoalsList();
            draggedGoalIndex = targetIndex;
          }
        }
      }, { passive: false });

      touchHandle.addEventListener("touchend", () => {
        goalItem.classList.remove("dragging");
        draggedGoalIndex = null;
      });
    }

    goalDisplay.appendChild(goalItem);
  });
}

function handleGoalActions(event) {
  const button = event.target.closest("button[data-goal-action]");
  if (!button) return;

  const action = button.dataset.goalAction;
  const id = button.dataset.id;
  const item = button.closest(".goal-item");
  const index = item ? Number(item.dataset.index) : -1;

  if (action === "delete") {
    deleteGoal(id, index);
  } else if (action === "edit") {
    editGoal(id, index);
  }
}

function deleteGoal(id, index) {
  let targetIndex = -1;

  if (id !== undefined && id !== null && id !== "" && id !== "undefined") {
    targetIndex = goals.findIndex((g) => String(g.id) === String(id));
  }

  if (targetIndex === -1 && typeof index === "number" && index >= 0 && index < goals.length) {
    targetIndex = index;
  }

  if (targetIndex !== -1) {
    goals.splice(targetIndex, 1);
    persistGoalsToStorage();
    renderGoalsList();
  }
}

function editGoal(id, index) {
  let targetIndex = -1;

  if (id !== undefined && id !== null && id !== "" && id !== "undefined") {
    targetIndex = goals.findIndex((g) => String(g.id) === String(id));
  }

  if (targetIndex === -1 && typeof index === "number" && index >= 0 && index < goals.length) {
    targetIndex = index;
  }

  if (targetIndex === -1) return;

  const targetGoal = goals[targetIndex];
  const updatedText = prompt("Edit your daily goal:", targetGoal.text || "");
  if (updatedText === null) return;

  const trimmed = updatedText.trim();
  if (!trimmed || !/\S/.test(trimmed)) {
    alert("Goal cannot be empty or only spaces.");
    return;
  }

  targetGoal.text = trimmed;
  persistGoalsToStorage();
  renderGoalsList();
}

function persistGoalsToStorage() {
  storage.set(GOALS_KEY, goals);
}

// =========================================
// UTILITIES
// =========================================
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}