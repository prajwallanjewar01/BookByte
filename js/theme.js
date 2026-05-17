// =========================================
// IMPORTS
// =========================================

import {
  storage,
  STORAGE_KEYS
} from './storage.js';

// =========================================
// ELEMENTS
// =========================================

const body = document.body;

const themeToggleBtn =
  document.getElementById(
    'theme-toggle'
  );

// =========================================
// DEFAULT THEME
// =========================================

const DEFAULT_THEME = 'dark';

// =========================================
// INIT
// =========================================

export function initTheme() {

  // ===============================
  // ELEMENT CHECK
  // ===============================

  if (!themeToggleBtn) {

    console.error(
      '❌ Theme toggle button not found'
    );

    return;
  }

  // ===============================
  // LOAD SAVED THEME
  // ===============================

  const savedTheme =
    storage.get(
      STORAGE_KEYS.THEME,
      DEFAULT_THEME
    );

  applyTheme(savedTheme);

  // ===============================
  // BUTTON EVENT
  // ===============================

  themeToggleBtn.addEventListener(
    'click',
    toggleTheme
  );

  console.log(
    '✅ Theme Module Ready'
  );
}

// =========================================
// TOGGLE THEME
// =========================================

function toggleTheme() {

  const isLight =
    body.classList.contains('light');

  const nextTheme =
    isLight
      ? 'dark'
      : 'light';

  applyTheme(nextTheme);
}

// =========================================
// APPLY THEME
// =========================================

function applyTheme(theme) {

  // ===============================
  // RESET CLASSES
  // ===============================

  body.classList.remove(
    'light',
    'dark'
  );

  // ===============================
  // APPLY NEW THEME
  // ===============================

  body.classList.add(theme);

  // ===============================
  // UPDATE BUTTON
  // ===============================

  updateToggleButton(theme);

  // ===============================
  // SAVE
  // ===============================

  storage.set(
    STORAGE_KEYS.THEME,
    theme
  );

  // ===============================
  // META THEME COLOR
  // ===============================

  updateMetaTheme(theme);

  console.log(
    `🎨 Theme Applied: ${theme}`
  );
}

// =========================================
// UPDATE BUTTON TEXT
// =========================================

function updateToggleButton(theme) {

  if (!themeToggleBtn) {
    return;
  }

  if (theme === 'light') {

    themeToggleBtn.textContent =
      '🌙 Dark';
  }

  else {

    themeToggleBtn.textContent =
      '🌞 Light';
  }
}

// =========================================
// UPDATE META COLOR
// =========================================

function updateMetaTheme(theme) {

  const metaTheme =
    document.querySelector(
      'meta[name=\"theme-color\"]'
    );

  if (!metaTheme) {
    return;
  }

  metaTheme.setAttribute(
    'content',
    theme === 'light'
      ? '#f5f7fb'
      : '#0b0e13'
  );
}

// =========================================
// OPTIONAL HELPERS
// =========================================

export function getCurrentTheme() {

  return body.classList.contains('light')
    ? 'light'
    : 'dark';
}

export function isDarkTheme() {

  return body.classList.contains('dark');
}

export function isLightTheme() {

  return body.classList.contains('light');
}