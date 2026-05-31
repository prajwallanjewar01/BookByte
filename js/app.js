// =========================================
// IMPORT MODULES
// =========================================

import { initTheme } from './theme.js';

import { initClocks } from './clocks.js';

import { initQuotes } from './quotes.js';

import { initBookmarks } from './bookmarks.js';

import { initTasks } from './tasks.js';

import { initPomodoro } from './pomodoro.js';

import { initConverter } from './converter.js';

// =========================================
// SAFE MODULE INITIALIZER
// =========================================

function safeInit(name, fn) {

  try {

    if (typeof fn === 'function') {

      fn();

      console.log(`✅ ${name} initialized`);

    } else {

      console.warn(
        `⚠️ ${name} is not a function`
      );
    }

  }

  catch (error) {

    console.error(
      `❌ ${name} failed:`,
      error
    );
  }
}

// =========================================
// MAIN APP INITIALIZER
// =========================================

function initApp() {

  console.log(
    '🚀 Initializing BookByte OS...'
  );

  // ===============================
  // MODULE INITIALIZATION
  // ===============================

  safeInit(
    'Theme Module',
    initTheme
  );

  safeInit(
    'Clock Module',
    initClocks
  );

  safeInit(
    'Quotes Module',
    initQuotes
  );

  safeInit(
    'Bookmarks Module',
    initBookmarks
  );

  safeInit(
    'Tasks Module',
    initTasks
  );

  safeInit(
    'Pomodoro Module',
    initPomodoro
  );

  safeInit(
    'Converter Module',
    initConverter
  );

  // ===============================
  // GLOBAL APP EVENTS
  // ===============================

  initGlobalEvents();

  console.log(
    '✅ BookByte OS Ready'
  );
}

// =========================================
// GLOBAL EVENTS
// =========================================

function initGlobalEvents() {

  // ===============================
  // FOCUS MODE
  // ===============================

  const focusBtn =
    document.getElementById(
      'focus-mode'
    );

  if (focusBtn) {

    focusBtn.addEventListener(
      'click',
      () => {

        document.body.classList.toggle(
          'focus-mode-active'
        );

        const active =
          document.body.classList.contains(
            'focus-mode-active'
          );

        focusBtn.textContent =
          active
            ? '☀️ Exit Focus'
            : '🌙 Focus Mode';
      }
    );
  }

  // ===============================
  // ENTER KEY SUPPORT
  // ===============================

  const taskInput =
    document.getElementById(
      'task-input'
    );

  const addTaskBtn =
    document.getElementById(
      'add-task'
    );

  if (
    taskInput &&
    addTaskBtn
  ) {

    taskInput.addEventListener(
      'keypress',
      (event) => {

        if (event.key === 'Enter') {

          event.preventDefault();

          addTaskBtn.click();
        }
      }
    );
  }

  // ===============================
  // AUTO SET CURRENT TIME
  // ===============================

  const timeInput =
    document.getElementById(
      'time-input'
    );

  if (
    timeInput &&
    !timeInput.value
  ) {

    const now = new Date();

    const local =
      new Date(
        now.getTime() -
        now.getTimezoneOffset() * 60000
      )
      .toISOString()
      .slice(0, 16);

    timeInput.value = local;
  }
}

// =========================================
// DOM READY
// =========================================

document.addEventListener(
  'DOMContentLoaded',
  initApp
);