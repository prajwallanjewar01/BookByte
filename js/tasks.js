import {
  storage
} from "./storage.js";

// =========================================
// STORAGE KEYS
// =========================================
const TASKS_KEY = "tasks";
const GOALS_KEY = "dailyGoalsList";

// =========================================
// STATE
// =========================================
let tasks = storage.get(TASKS_KEY, []);
let goals = storage.get(GOALS_KEY, []);

// =========================================
// ELEMENTS
// =========================================
const list = document.getElementById("task-list");
const addBtn = document.getElementById("add-task");
const input = document.getElementById("task-input");

// =========================================
// GOAL ELEMENTS
// =========================================
const goalInput = document.getElementById("goal-input");
const saveGoalBtn = document.getElementById("save-goal");
const goalDisplay = document.getElementById("goal-display");  

// =========================================
// DRAG STATE (COMPARTMENTALIZED)
// =========================================
let draggedIndex = null;
let draggedGoalIndex = null;

// =========================================
// INIT
// =========================================
export function initTasks() {
  if (!list || !addBtn || !input) {
    console.error("❌ Task elements missing");
    return;
  }

  renderTasks();
  renderGoalsList(); // Safely triggers the dynamic goals array engine

  // ===============================
  // EVENTS
  // ===============================
  addBtn.addEventListener("click", addTask);
  
  if (saveGoalBtn) {
    saveGoalBtn.addEventListener("click", saveGoal);
  }

  // ===============================
  // ENTER KEY LISTENERS
  // ===============================
  input.addEventListener("keypress", event => {
    if (event.key === "Enter") {
      addTask();
    }
  });

  if (goalInput) {
    goalInput.addEventListener("keypress", event => {
      if (event.key === "Enter") {
        saveGoal();
      }
    });
  }

  // ===============================
  // EVENT DELEGATION
  // ===============================
  list.addEventListener("click", handleActions);

  if (goalDisplay) {
    goalDisplay.addEventListener("click", handleGoalActions);
  }

  console.log("✅ Tasks & Goals Ready");
}

// =========================================
// ADD TASK
// =========================================
function addTask() {
  const value = input.value.trim();

  if (!value) {
    alert("Please enter a task.");
    return;
  }

  const task = {
    id: Date.now(),
    text: value,
    completed: false,
    createdAt: new Date().toISOString()
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

  if (!tasks.length) {
    list.innerHTML = `
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

    item.innerHTML = `
      <div class="task-drag-handle" title="Drag to reorder">☰</div>

      <div class="task-left-checkbox">
        <input
          type="checkbox"
          data-action="toggle"
          data-id="${task.id}"
          ${task.completed ? "checked" : ""}
        />
      </div>

      <div class="task-text-container">
        <span class="task-text ${task.completed ? 'completed' : ''}">
          ${escapeHTML(task.text)}
        </span>
      </div>

      <div class="task-actions">
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

    // DESKTOP MOUSE DRAG EVENTS
    item.addEventListener("dragstart", () => {
      draggedIndex = index;
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      draggedIndex = null;
    });

    item.addEventListener("dragover", (e) => e.preventDefault());

    item.addEventListener("drop", () => {
      moveTask(draggedIndex, index);
    });

    // MOBILE TOUCH DRAG EVENTS
    const handle = item.querySelector('.task-drag-handle');
    if (handle) {
      handle.addEventListener('touchstart', (e) => {
        draggedIndex = index;
        item.classList.add('dragging');
        e.stopPropagation();
      }, { passive: true });

      handle.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touchLocation = e.touches[0];
        const targetElement = document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
        const closestItem = targetElement?.closest('.task-item');
        
        if (closestItem && closestItem !== item && !closestItem.classList.contains('goal-item')) {
          const targetIndex = Number(closestItem.dataset.index);
          if (!isNaN(targetIndex) && targetIndex !== draggedIndex) {
            moveTask(draggedIndex, targetIndex);
            draggedIndex = targetIndex; 
          }
        }
      }, { passive: false });

      handle.addEventListener('touchend', () => {
        item.classList.remove('dragging');
        draggedIndex = null;
      });
    }

    list.appendChild(item);
  });
}

// =========================================
// ACTION DELEGATION FRAMEWORKS
// =========================================
function handleActions(event) {
  const targetBtn = event.target.closest('button') || event.target;
  const action = targetBtn.dataset.action || event.target.dataset.action;
  const id = Number(targetBtn.dataset.id || event.target.dataset.id);

  if (event.target.type === "checkbox") {
    const checkId = Number(event.target.dataset.id);
    toggleTask(checkId);
    return;
  }

  if (!action || !id) return;

  if (action === "delete") deleteTask(id);
  if (action === "edit") editTask(id);
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const updated = prompt("Edit task:", task.text);
  if (updated === null) return;

  const trimmed = updated.trim();
  if (!trimmed) {
    alert("Task cannot be empty.");
    return;
  }

  task.text = trimmed;
  saveTasks();
  renderTasks();
}

function moveTask(from, to) {
  if (from === null || to === null || from === to) return;
  const moved = tasks.splice(from, 1)[0];
  tasks.splice(to, 0, moved);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  storage.set(TASKS_KEY, tasks);
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// =========================================
// MULTI-GOAL ENGINE MANAGEMENT
// =========================================
function saveGoal() {
  const goalValue = goalInput.value.trim();

  if (!goalValue) {
    alert("Please enter a goal.");
    return;
  }

  const newGoal = {
    id: Date.now(),
    text: goalValue,
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

    // Assembled markup first so selectors exist inside DOM nodes correctly
    goalItem.innerHTML = `
      <div class="task-drag-handle" title="Drag to reorder">☰</div>
      
      <div class="task-text-container" style="padding-left: 8px;">
        <span class="task-text">🎯 ${escapeHTML(goal.text)}</span>
      </div>

      <div class="task-actions">
        <button
          data-goal-action="edit"
          data-id="${goal.id}"
          title="Edit Goal"
        >
          ✏️
        </button>
        <button
          data-goal-action="delete"
          data-id="${goal.id}"
          title="Delete Goal"
        >
          ❌
        </button>
      </div>
    `;

    // DESKTOP MOUSE DRAG LISTENERS
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
        const movedGoal = goals.splice(draggedGoalIndex, 1)[0];
        goals.splice(index, 0, movedGoal);
        persistGoalsToStorage();
        renderGoalsList();
      }
    });

    // CONNECT MOBILE TOUCH HANDLERS Safely
    const touchHandle = goalItem.querySelector('.task-drag-handle');
    if (touchHandle) {
      touchHandle.addEventListener('touchstart', (e) => {
        draggedGoalIndex = index;
        goalItem.classList.add('dragging');
        e.stopPropagation();
      }, { passive: true });

      touchHandle.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touchLocation = e.touches[0];
        const targetElement = document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
        const closestGoal = targetElement?.closest('.goal-item');
        
        if (closestGoal && closestGoal !== goalItem) {
          const targetIndex = Number(closestGoal.dataset.index);
          if (!isNaN(targetIndex) && targetIndex !== draggedGoalIndex) {
            const movedGoal = goals.splice(draggedGoalIndex, 1)[0];
            goals.splice(targetIndex, 0, movedGoal);
            persistGoalsToStorage();
            renderGoalsList();
            draggedGoalIndex = targetIndex;
          }
        }
      }, { passive: false });

      touchHandle.addEventListener('touchend', () => {
        goalItem.classList.remove('dragging');
        draggedGoalIndex = null;
      });
    }

    goalDisplay.appendChild(goalItem);
  });
}

function handleGoalActions(event) {
  const targetBtn = event.target.closest('button') || event.target;
  const action = targetBtn.dataset.goalAction || event.target.dataset.goalAction;
  const id = Number(targetBtn.dataset.id || event.target.dataset.id);

  if (!action || !id) return;

  if (action === "delete") {
    goals = goals.filter(g => g.id !== id);
    persistGoalsToStorage();
    renderGoalsList();
  }

  if (action === "edit") {
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return;

    const updatedText = prompt("Edit your daily goal:", targetGoal.text);
    if (updatedText === null) return;

    const trimmed = updatedText.trim();
    if (!trimmed) {
      alert("Goal cannot be empty.");
      return;
    }

    targetGoal.text = trimmed;
    persistGoalsToStorage();
    renderGoalsList();
  }
}

function persistGoalsToStorage() {
  storage.set(GOALS_KEY, goals);
}