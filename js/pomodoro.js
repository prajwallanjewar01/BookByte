// =========================================
// ELEMENTS
// =========================================

const modeText =
  document.getElementById(
    'pomodoro-mode'
  );

const timeText =
  document.getElementById(
    'pomodoro-time'
  );

const startBtn =
  document.getElementById(
    'pomodoro-start'
  );

const resetBtn =
  document.getElementById(
    'pomodoro-reset'
  );

const switchBtn =
  document.getElementById(
    'pomodoro-switch'
  );

// =========================================
// CONFIG
// =========================================

const FOCUS_DURATION = 25 * 60;

const BREAK_DURATION = 5 * 60;

// =========================================
// STATE
// =========================================

let currentMode = 'focus';

let remainingSeconds =
  FOCUS_DURATION;

let timerInterval = null;

let isRunning = false;

// =========================================
// INIT
// =========================================

export function initPomodoro() {

  // ===============================
  // ELEMENT VALIDATION
  // ===============================

  if (
    !modeText ||
    !timeText ||
    !startBtn ||
    !resetBtn ||
    !switchBtn
  ) {

    console.error(
      '❌ Pomodoro module elements missing'
    );

    return;
  }

  // ===============================
  // INITIAL UI
  // ===============================

  updateTimerUI();

  updateModeUI();

  // ===============================
  // EVENTS
  // ===============================

  startBtn.addEventListener(
    'click',
    toggleTimer
  );

  resetBtn.addEventListener(
    'click',
    resetTimer
  );

  switchBtn.addEventListener(
    'click',
    switchMode
  );

  console.log(
    '✅ Pomodoro Module Ready'
  );
}

// =========================================
// TOGGLE TIMER
// =========================================

function toggleTimer() {

  if (isRunning) {

    pauseTimer();
  }

  else {

    startTimer();
  }
}

// =========================================
// START TIMER
// =========================================

function startTimer() {

  // ===============================
  // PREVENT DUPLICATES
  // ===============================

  if (timerInterval) {

    clearInterval(
      timerInterval
    );
  }

  isRunning = true;

  updateStartButton();

  timerInterval =
    setInterval(() => {

      remainingSeconds--;

      updateTimerUI();

      // ===========================
      // TIMER COMPLETE
      // ===========================

      if (remainingSeconds <= 0) {

        completeSession();
      }

    }, 1000);
}

// =========================================
// PAUSE TIMER
// =========================================

function pauseTimer() {

  clearInterval(
    timerInterval
  );

  timerInterval = null;

  isRunning = false;

  updateStartButton();
}

// =========================================
// RESET TIMER
// =========================================

function resetTimer() {

  pauseTimer();

  remainingSeconds =
    currentMode === 'focus'
      ? FOCUS_DURATION
      : BREAK_DURATION;

  updateTimerUI();
}

// =========================================
// SWITCH MODE
// =========================================

function switchMode() {

  pauseTimer();

  currentMode =
    currentMode === 'focus'
      ? 'break'
      : 'focus';

  remainingSeconds =
    currentMode === 'focus'
      ? FOCUS_DURATION
      : BREAK_DURATION;

  updateModeUI();

  updateTimerUI();
}

// =========================================
// COMPLETE SESSION
// =========================================

function completeSession() {

  pauseTimer();

  playAlert();

  alert(
    currentMode === 'focus'
      ? '🎉 Focus session completed!'
      : '☕ Break time completed!'
  );

  // ===============================
  // AUTO SWITCH
  // ===============================

  currentMode =
    currentMode === 'focus'
      ? 'break'
      : 'focus';

  remainingSeconds =
    currentMode === 'focus'
      ? FOCUS_DURATION
      : BREAK_DURATION;

  updateModeUI();

  updateTimerUI();
}

// =========================================
// UPDATE TIMER UI
// =========================================

function updateTimerUI() {

  const minutes =
    String(
      Math.floor(
        remainingSeconds / 60
      )
    ).padStart(2, '0');

  const seconds =
    String(
      remainingSeconds % 60
    ).padStart(2, '0');

  timeText.textContent =
    `${minutes}:${seconds}`;
}

// =========================================
// UPDATE MODE UI
// =========================================

function updateModeUI() {

  if (currentMode === 'focus') {

    modeText.textContent =
      'Focus Mode';
  }

  else {

    modeText.textContent =
      'Break Mode';
  }
}

// =========================================
// UPDATE START BUTTON
// =========================================

function updateStartButton() {

  startBtn.textContent =
    isRunning
      ? 'Pause'
      : 'Start';
}

// =========================================
// ALERT SOUND
// =========================================

function playAlert() {

  try {

    const audio =
      new Audio(
        'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
      );

    audio.play();

  }

  catch (error) {

    console.warn(
      '⚠️ Audio playback failed',
      error
    );
  }
}