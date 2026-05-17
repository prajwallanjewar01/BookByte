import {
  storage
} from "./storage.js";

// =========================================
// STORAGE KEY
// =========================================

const TASKS_KEY = "tasks";

// =========================================
// STATE
// =========================================

let tasks =
  storage.get(
    TASKS_KEY,
    []
  );

// =========================================
// ELEMENTS
// =========================================

const list =
  document.getElementById(
    "task-list"
  );

const addBtn =
  document.getElementById(
    "add-task"
  );

const input =
  document.getElementById(
    "task-input"
  );

// =========================================
// GOAL ELEMENTS
// =========================================

const goalInput =
  document.getElementById(
    "goal-input"
  );

const saveGoalBtn =
  document.getElementById(
    "save-goal"
  );

const goalDisplay =
  document.getElementById(
    "goal-display"
  );  

// =========================================
// DRAG STATE
// =========================================

let draggedIndex = null;

// =========================================
// INIT
// =========================================

export function initTasks() {

  if (
    !list ||
    !addBtn ||
    !input
  ) {

    console.error(
      "❌ Task elements missing"
    );

    return;
  }

  renderTasks();
  loadGoal();

  // ===============================
  // ADD TASK
  // ===============================

  addBtn.addEventListener(
    "click",
    addTask
  );
  saveGoalBtn?.addEventListener(
  "click",
  saveGoal
);

  // ===============================
  // ENTER KEY
  // ===============================

  input.addEventListener(
    "keypress",
    event => {

      if (event.key === "Enter") {

        addTask();
      }
    }
  );

  // ===============================
  // EVENT DELEGATION
  // ===============================

  list.addEventListener(
    "click",
    handleActions
  );

  console.log(
    "✅ Tasks Ready"
  );
}

// =========================================
// ADD TASK
// =========================================

function addTask() {

  const value =
    input.value.trim();

  if (!value) {

    alert(
      "Please enter a task."
    );

    return;
  }

  const task = {

    id: Date.now(),

    text: value,

    completed: false,

    createdAt:
      new Date().toISOString()
  };

  tasks.unshift(task);

  saveTasks();

  renderTasks();

  input.value = "";

  input.focus();
}

// =========================================
// RENDER TASKS
// =========================================

function renderTasks() {

  list.innerHTML = "";

  // ===============================
  // EMPTY STATE
  // ===============================

  if (!tasks.length) {

    list.innerHTML = `
      <div class="card">
        <p>
          No tasks added yet.
        </p>
      </div>
    `;

    return;
  }

  // ===============================
  // RENDER
  // ===============================

  tasks.forEach(
    (task, index) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "task-item";

      item.draggable = true;

      item.dataset.index =
        index;

      // ===========================
      // DRAG EVENTS
      // ===========================

      item.addEventListener(
        "dragstart",
        () => {

          draggedIndex = index;

          item.classList.add(
            "dragging"
          );
        }
      );

      item.addEventListener(
        "dragend",
        () => {

          item.classList.remove(
            "dragging"
          );
        }
      );

      item.addEventListener(
        "dragover",
        event => {

          event.preventDefault();
        }
      );

      item.addEventListener(
        "drop",
        () => {

          moveTask(
            draggedIndex,
            index
          );
        }
      );

      // ===========================
      // TEMPLATE
      // ===========================

      item.innerHTML = `

        <div class="task-left">

          <input
            type="checkbox"
            data-action="toggle"
            data-id="${task.id}"
            ${task.completed ? "checked" : ""}
          />

          <span
            class="
              task-text
              ${task.completed ? "completed" : ""}
            "
          >
            ${escapeHTML(task.text)}
          </span>

        </div>

        <div class="task-actions">

          <button
            data-action="up"
            data-id="${task.id}"
            title="Move Up"
          >
            ⬆️
          </button>

          <button
            data-action="down"
            data-id="${task.id}"
            title="Move Down"
          >
            ⬇️
          </button>

          <button
            data-action="edit"
            data-id="${task.id}"
            title="Edit"
          >
            ✏️
          </button>

          <button
            data-action="delete"
            data-id="${task.id}"
            title="Delete"
          >
            ❌
          </button>

        </div>
      `;

      list.appendChild(item);
    }
  );
}

// =========================================
// HANDLE ACTIONS
// =========================================

function handleActions(event) {

  const action =
    event.target.dataset.action;

  const id =
    Number(
      event.target.dataset.id
    );

  if (!action || !id) {
    return;
  }

  // ===============================
  // DELETE
  // ===============================

  if (action === "delete") {

    deleteTask(id);
  }

  // ===============================
  // TOGGLE
  // ===============================

  if (action === "toggle") {

    toggleTask(id);
  }

  // ===============================
  // EDIT
  // ===============================

  if (action === "edit") {

    editTask(id);
  }

  // ===============================
  // MOVE UP
  // ===============================

  if (action === "up") {

    moveUp(id);
  }

  // ===============================
  // MOVE DOWN
  // ===============================

  if (action === "down") {

    moveDown(id);
  }
}

// =========================================
// DELETE
// =========================================

function deleteTask(id) {

  tasks =
    tasks.filter(
      task => task.id !== id
    );

  saveTasks();

  renderTasks();
}

// =========================================
// TOGGLE
// =========================================

function toggleTask(id) {

  tasks = tasks.map(task => {

    if (task.id === id) {

      return {

        ...task,

        completed:
          !task.completed
      };
    }

    return task;
  });

  saveTasks();

  renderTasks();
}

// =========================================
// EDIT
// =========================================

function editTask(id) {

  const task =
    tasks.find(
      t => t.id === id
    );

  if (!task) {
    return;
  }

  const updated =
    prompt(
      "Edit task:",
      task.text
    );

  if (
    updated === null
  ) {
    return;
  }

  const trimmed =
    updated.trim();

  if (!trimmed) {

    alert(
      "Task cannot be empty."
    );

    return;
  }

  task.text = trimmed;

  saveTasks();

  renderTasks();
}

// =========================================
// MOVE TASK
// =========================================

function moveTask(
  from,
  to
) {

  if (
    from === null ||
    to === null ||
    from === to
  ) {
    return;
  }

  const moved =
    tasks.splice(from, 1)[0];

  tasks.splice(
    to,
    0,
    moved
  );

  saveTasks();

  renderTasks();
}

// =========================================
// MOVE UP
// =========================================

function moveUp(id) {

  const index =
    tasks.findIndex(
      task => task.id === id
    );

  if (index <= 0) {
    return;
  }

  [
    tasks[index - 1],
    tasks[index]
  ] = [
    tasks[index],
    tasks[index - 1]
  ];

  saveTasks();

  renderTasks();
}

// =========================================
// MOVE DOWN
// =========================================

function moveDown(id) {

  const index =
    tasks.findIndex(
      task => task.id === id
    );

  if (
    index === -1 ||
    index >= tasks.length - 1
  ) {
    return;
  }

  [
    tasks[index],
    tasks[index + 1]
  ] = [
    tasks[index + 1],
    tasks[index]
  ];

  saveTasks();

  renderTasks();
}

// =========================================
// SAVE
// =========================================

function saveTasks() {

  storage.set(
    TASKS_KEY,
    tasks
  );
}

// =========================================
// SAFE HTML
// =========================================

function escapeHTML(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent = text;

  return div.innerHTML;
}

// =========================================
// DAILY GOAL SYSTEM
// =========================================

function saveGoal() {

  const goal =
    goalInput.value.trim();

  // ===============================
  // VALIDATION
  // ===============================

  if (!goal) {

    alert(
      "Please enter a goal."
    );

    return;
  }

  // ===============================
  // SAVE
  // ===============================

  storage.set(
    "dailyGoal",
    goal
  );

  renderGoal(goal);

  goalInput.value = "";
}

// =========================================
// LOAD GOAL
// =========================================

function loadGoal() {

  const goal =
    storage.get(
      "dailyGoal",
      ""
    );

  renderGoal(goal);
}

// =========================================
// RENDER GOAL
// =========================================

function renderGoal(goal) {

  if (!goalDisplay) {
    return;
  }

  goalDisplay.textContent =
    goal
      ? `🎯 ${goal}`
      : "No daily goal set.";
}