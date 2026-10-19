// =========================================
// DOM ELEMENTS HOOK SELECTION
// =========================================
const container = document.getElementById('pomodoro-container');
const modeText = document.getElementById('pomodoro-mode');
const startBtn = document.getElementById('pomodoro-start');
const resetBtn = document.getElementById('pomodoro-reset');
const fullscreenBtn = document.getElementById('pomodoro-fullscreen');
const exitFullscreenBtn = document.getElementById('pomodoro-exit-fullscreen');

const modeFocusBtn = document.getElementById('mode-focus');
const modeShortBtn = document.getElementById('mode-short');
const modeLongBtn = document.getElementById('mode-long');
const modeCustomBtn = document.getElementById('mode-custom');

// Custom Time Console Elements
const customInputH = document.getElementById('custom-input-h');
const customInputM = document.getElementById('custom-input-m');
const customInputS = document.getElementById('custom-input-s');
const customConsole = document.getElementById('custom-time-console');

// =========================================
// RUNTIME INTERVAL STRUCTURES
// =========================================
const savedCustomTotalSeconds = parseInt(localStorage.getItem('bookbyte-custom-pomodoro-seconds'), 10) || 45 * 60;

const MODES = {
  focus: { duration: 25 * 60, label: 'Focus Mode' },
  shortBreak: { duration: 5 * 60, label: 'Short Break' },
  longBreak: { duration: 15 * 60, label: 'Long Break' },
  custom: { duration: savedCustomTotalSeconds, label: 'Custom Mode' }
};

let currentMode = 'focus';
let remainingSeconds = MODES[currentMode].duration;
let timerInterval = null;
let isRunning = false;

// Memory buffer tracking digit positions to avoid redundant animations
let previousDigits = ["0", "0", "0", "0", "0", "0"];

// Web Audio API context for mechanical sound effects
let audioContextBuffer = null;
let audioCtx = null;

// =========================================
// SYSTEM INITIALIZATION
// =========================================
export function initPomodoro() {
  if (!startBtn || !container) {
    console.error('❌ Pomodoro core layout targets missing');
    return;
  }

  syncTimerToFlaps(remainingSeconds, true);
  updateModeUI();
  syncCustomConsoleInputs(MODES.custom.duration);

  // Primary Listeners
  startBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetTimer);
  fullscreenBtn?.addEventListener('click', enterFullscreen);
  exitFullscreenBtn?.addEventListener('click', exitFullscreen);

  // Mode Selection Tabs
  modeFocusBtn?.addEventListener('click', () => changeIntervalMode('focus'));
  modeShortBtn?.addEventListener('click', () => changeIntervalMode('shortBreak'));
  modeLongBtn?.addEventListener('click', () => changeIntervalMode('longBreak'));
  modeCustomBtn?.addEventListener('click', () => changeIntervalMode('custom'));

  // Stepper Buttons (+ / −) on Flip Cards
  container.addEventListener('click', handleStepperClicks);

  // Direct Number Input in Custom Console
  customInputH?.addEventListener('input', handleDirectConsoleInput);
  customInputM?.addEventListener('input', handleDirectConsoleInput);
  customInputS?.addEventListener('input', handleDirectConsoleInput);

  document.addEventListener('fullscreenchange', handleFullscreenStateChange);

  preloadAudioEngine();

  console.log('✅ 3D Mechanical Split-Flap Pomodoro Ready');
}

// =========================================
// MODE CONTROL & TRANSITIONS
// =========================================
function changeIntervalMode(mode) {
  if (isRunning) {
    const swapConfirmation = confirm("An active session is running. Switch modes?");
    if (!swapConfirmation) return;
  }
  pauseTimer();

  currentMode = mode;
  remainingSeconds = MODES[currentMode].duration;

  if (mode === 'custom') {
    container.classList.add('is-custom-mode');
    syncCustomConsoleInputs(remainingSeconds);
  } else {
    container.classList.remove('is-custom-mode');
  }

  updateModeUI();
  syncTimerToFlaps(remainingSeconds, false);
}

function updateModeUI() {
  if (modeText) modeText.textContent = MODES[currentMode].label;
  if (modeFocusBtn) modeFocusBtn.className = currentMode === 'focus' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
  if (modeShortBtn) modeShortBtn.className = currentMode === 'shortBreak' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
  if (modeLongBtn) modeLongBtn.className = currentMode === 'longBreak' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
  if (modeCustomBtn) modeCustomBtn.className = currentMode === 'custom' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
}

// =========================================
// CUSTOM TIME STEPPERS & LIVE EDITING
// =========================================
function handleStepperClicks(event) {
  if (isRunning) return;

  // 1. Column Stepper (+ / − above/below cards)
  const unitStepper = event.target.closest('.unit-stepper');
  if (unitStepper) {
    const unit = unitStepper.dataset.step;
    const val = parseInt(unitStepper.dataset.val, 10);
    applyTimeDelta(unit, val);
    return;
  }

  // 2. Mini Stepper inside Custom Console
  const miniStep = event.target.closest('.mini-step');
  if (miniStep) {
    const unit = miniStep.dataset.step;
    const val = parseInt(miniStep.dataset.val, 10);
    applyTimeDelta(unit, val);
    return;
  }

  // 3. Quick Adjust Pills (+5m, -5m, +15s, etc.)
  const quickPill = event.target.closest('.quick-pill[data-quick]');
  if (quickPill) {
    const secondsDelta = parseInt(quickPill.dataset.quick, 10);
    adjustCustomDurationSeconds(secondsDelta);
    return;
  }

  // 4. Preset Pills (25m, 45m, 60m)
  const presetPill = event.target.closest('.quick-pill[data-preset]');
  if (presetPill) {
    const minutes = parseInt(presetPill.dataset.preset, 10);
    setCustomDurationSeconds(minutes * 60);
    return;
  }
}

function applyTimeDelta(unit, value) {
  let deltaSeconds = 0;
  if (unit === 'h') deltaSeconds = value * 3600;
  if (unit === 'm') deltaSeconds = value * 60;
  if (unit === 's') deltaSeconds = value;

  adjustCustomDurationSeconds(deltaSeconds);
}

function adjustCustomDurationSeconds(delta) {
  let target = (currentMode === 'custom' ? remainingSeconds : MODES.custom.duration) + delta;
  if (target < 5) target = 5; // Minimum 5 seconds
  if (target > 359999) target = 359999; // Maximum 99h 59m 59s

  setCustomDurationSeconds(target);
}

function setCustomDurationSeconds(totalSeconds) {
  MODES.custom.duration = totalSeconds;
  remainingSeconds = totalSeconds;

  // Automatically switch into Custom mode if user adjusts while in another tab
  if (currentMode !== 'custom') {
    currentMode = 'custom';
    container.classList.add('is-custom-mode');
  }

  try {
    localStorage.setItem('bookbyte-custom-pomodoro-seconds', totalSeconds);
  } catch (e) {
    console.warn("Storage write skipped", e);
  }

  syncCustomConsoleInputs(totalSeconds);
  updateModeUI();
  syncTimerToFlaps(remainingSeconds, false);
  playMechanicalAudioClack();
}

function handleDirectConsoleInput() {
  if (isRunning) return;

  const h = Math.max(0, Math.min(99, parseInt(customInputH?.value, 10) || 0));
  const m = Math.max(0, Math.min(59, parseInt(customInputM?.value, 10) || 0));
  const s = Math.max(0, Math.min(59, parseInt(customInputS?.value, 10) || 0));

  let total = h * 3600 + m * 60 + s;
  if (total <= 0) total = 5;

  MODES.custom.duration = total;
  remainingSeconds = total;

  try {
    localStorage.setItem('bookbyte-custom-pomodoro-seconds', total);
  } catch (e) {
    console.warn("Storage write skipped", e);
  }

  updateModeUI();
  syncTimerToFlaps(remainingSeconds, false);
}

function syncCustomConsoleInputs(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (customInputH) customInputH.value = hours;
  if (customInputM) customInputM.value = minutes;
  if (customInputS) customInputS.value = seconds;
}

// =========================================
// TIMER CONTROLS
// =========================================
function toggleTimer() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (remainingSeconds <= 0) {
    alert("Please set a duration greater than 0 seconds.");
    return;
  }

  if (timerInterval) clearInterval(timerInterval);
  isRunning = true;
  updateStartControlsUI();

  container.classList.add('timer-running');

  const absoluteTerminalTime = Date.now() + remainingSeconds * 1000;

  timerInterval = setInterval(() => {
    remainingSeconds = Math.round((absoluteTerminalTime - Date.now()) / 1000);

    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      syncTimerToFlaps(remainingSeconds, false);
      sessionCompletionWorkflow();
    } else {
      syncTimerToFlaps(remainingSeconds, false);
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  updateStartControlsUI();
  container.classList.remove('timer-running');
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = MODES[currentMode].duration;
  syncTimerToFlaps(remainingSeconds, true);
  if (currentMode === 'custom') {
    syncCustomConsoleInputs(remainingSeconds);
  }
}

function sessionCompletionWorkflow() {
  pauseTimer();
  playAlertChime(true);

  let postCycleContext = "";
  if (currentMode === 'focus' || currentMode === 'custom') {
    postCycleContext = `🎉 ${MODES[currentMode].label} session completed! Time for a break.`;
    changeIntervalMode('shortBreak');
  } else {
    postCycleContext = "☕ Break cycle completed. Ready to focus again?";
    changeIntervalMode('focus');
  }

  setTimeout(() => alert(postCycleContext), 150);
}

function updateStartControlsUI() {
  if (!startBtn) return;
  startBtn.textContent = isRunning ? 'Pause' : 'Start';
  startBtn.className = isRunning ? 'btn btn-warning' : 'btn btn-primary';
}

// =========================================
// RE-EVALUATION DIGIT TRANSFORMATION LAYER
// =========================================
function syncTimerToFlaps(totalSeconds, absoluteOverride = false) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hString = String(hours).padStart(2, '0');
  const mString = String(minutes).padStart(2, '0');
  const sString = String(seconds).padStart(2, '0');

  const currentDigitMatrix = [hString[0], hString[1], mString[0], mString[1], sString[0], sString[1]];
  const structuralNodeIds = ["h1", "h2", "m1", "m2", "s1", "s2"];

  let hasFlippedAnyDigit = false;

  currentDigitMatrix.forEach((activeValue, slotIndex) => {
    const targetedDomId = structuralNodeIds[slotIndex];
    if (absoluteOverride || previousDigits[slotIndex] !== activeValue) {
      if (!absoluteOverride) {
        hasFlippedAnyDigit = true;
      }
      executeMechanicalFlapRotation(targetedDomId, previousDigits[slotIndex], activeValue, absoluteOverride);
    }
  });

  if (hasFlippedAnyDigit && isRunning) {
    playMechanicalAudioClack();
  }

  previousDigits = [...currentDigitMatrix];

  const outputString = hours > 0 ? `${hString}:${mString}:${sString}` : `${mString}:${sString}`;
  document.title = isRunning ? `(${outputString}) ${MODES[currentMode].label}` : `🔖 BookByte Productivity OS`;
}

function executeMechanicalFlapRotation(nodeId, staleValue, freshValue, instantForcedSync) {
  const parentNode = document.getElementById(nodeId);
  if (!parentNode) return;

  const topNodeSpan = parentNode.querySelector('.card-top span');
  const bottomNodeSpan = parentNode.querySelector('.card-bottom span');

  if (instantForcedSync) {
    if (topNodeSpan) topNodeSpan.textContent = freshValue;
    if (bottomNodeSpan) bottomNodeSpan.textContent = freshValue;
    parentNode.querySelectorAll('.card-flip-surface').forEach(el => el.remove());
    return;
  }

  parentNode.querySelectorAll('.card-flip-surface').forEach(el => el.remove());

  if (topNodeSpan) topNodeSpan.textContent = freshValue;
  if (bottomNodeSpan) bottomNodeSpan.textContent = staleValue;

  const flapUpper = document.createElement('div');
  flapUpper.className = 'card-flip-surface card-flip-upper';
  flapUpper.innerHTML = `<span>${staleValue}</span>`;

  const flapLower = document.createElement('div');
  flapLower.className = 'card-flip-surface card-flip-lower';
  flapLower.innerHTML = `<span>${freshValue}</span>`;

  parentNode.appendChild(flapUpper);
  parentNode.appendChild(flapLower);

  flapLower.addEventListener('animationend', () => {
    if (bottomNodeSpan) bottomNodeSpan.textContent = freshValue;
    flapUpper.remove();
    flapLower.remove();
  }, { once: true });
}

// =========================================
// FULLSCREEN FOCUS
// =========================================
function enterFullscreen() {
  if (container?.requestFullscreen) {
    container.requestFullscreen().catch(err => console.warn(err.message));
  }
  container?.classList.add('pomodoro-fullscreen');
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  container?.classList.remove('pomodoro-fullscreen');
}

function handleFullscreenStateChange() {
  if (!document.fullscreenElement) {
    container?.classList.remove('pomodoro-fullscreen');
  }
}

// =========================================
// AUDIO SIGNAL CONTROLLERS
// =========================================
function preloadAudioEngine() {
  try {
    audioContextBuffer = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
    audioContextBuffer.load();
  } catch (e) {
    console.warn("Audio buffer delayed", e);
  }
}

function playMechanicalAudioClack() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(250, now + 0.015);
    gain1.gain.setValueAtTime(0.035, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.02);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(170, now + 0.16);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.21);
    gain2.gain.setValueAtTime(0.05, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.22);
  } catch (err) {
    // Autoplay fallback
  }
}

function playAlertChime(isTerminalCompletionTone = false) {
  try {
    if (isTerminalCompletionTone) {
      if (audioContextBuffer) {
        audioContextBuffer.play();
      } else {
        const fallbackAudio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
        fallbackAudio.play();
      }
    }
  } catch (error) {
    // Autoplay fallback
  }
}