// =========================================
// CLOCK CONFIG
// =========================================

const CLOCKS = [

  {
    timezone: 'Asia/Kolkata',

    timeId: 'clock-ist',

    dateId: 'date-ist',

    phaseId: 'phase-ist'
  },

  {
    timezone: 'America/Chicago',

    timeId: 'clock-ct',

    dateId: 'date-ct',

    phaseId: 'phase-ct'
  },

  {
    timezone: 'UTC',

    timeId: 'clock-utc',

    dateId: 'date-utc',

    phaseId: 'phase-utc'
  }
];

// =========================================
// INIT
// =========================================

export function initClocks() {

  // ===============================
  // INITIAL UPDATE
  // ===============================

  updateAllClocks();

  // ===============================
  // LIVE CLOCK
  // ===============================

  setInterval(
    updateAllClocks,
    1000
  );

  console.log(
    '✅ Clocks Module Ready'
  );
}

// =========================================
// UPDATE ALL CLOCKS
// =========================================

function updateAllClocks() {

  CLOCKS.forEach(clock => {

    updateClock(clock);
  });
}

// =========================================
// UPDATE SINGLE CLOCK
// =========================================

function updateClock(config) {

  try {

    const timeElement =
      document.getElementById(
        config.timeId
      );

    const dateElement =
      document.getElementById(
        config.dateId
      );

    const phaseElement =
      document.getElementById(
        config.phaseId
      );

    // =============================
    // ELEMENT CHECK
    // =============================

    if (
      !timeElement ||
      !dateElement ||
      !phaseElement
    ) {

      console.warn(
        `⚠️ Missing clock elements for ${config.timezone}`
      );

      return;
    }

    const now =
      new Date();

    // =============================
    // TIME
    // =============================

    const timeFormatter =
      new Intl.DateTimeFormat(
        'en-US',
        {

          timeZone:
            config.timezone,

          hour: '2-digit',

          minute: '2-digit',

          second: '2-digit',

          hour12: true
        }
      );

    const formattedTime =
      timeFormatter.format(now);

    // =============================
    // DATE
    // =============================

    const dateFormatter =
      new Intl.DateTimeFormat(
        'en-US',
        {

          timeZone:
            config.timezone,

          weekday: 'long',

          year: 'numeric',

          month: 'long',

          day: 'numeric'
        }
      );

    const formattedDate =
      dateFormatter.format(now);

    // =============================
    // HOUR FOR PHASE
    // =============================

    const hourFormatter =
      new Intl.DateTimeFormat(
        'en-US',
        {

          timeZone:
            config.timezone,

          hour: 'numeric',

          hour12: false
        }
      );

    const hour =
      Number(
        hourFormatter.format(now)
      );

    const phase =
      getDayPhase(hour);

    // =============================
    // UPDATE UI
    // =============================

    timeElement.textContent =
      formattedTime;

    dateElement.textContent =
      formattedDate;

    phaseElement.textContent =
      phase;
  }

  catch (error) {

    console.error(
      `❌ Clock update failed for ${config.timezone}`,
      error
    );
  }
}

// =========================================
// DAY PHASE
// =========================================

function getDayPhase(hour) {

  if (hour >= 5 && hour < 12) {

    return '☀️ Morning';
  }

  if (hour >= 12 && hour < 17) {

    return '🌤️ Afternoon';
  }

  if (hour >= 17 && hour < 21) {

    return '🌙 Evening';
  }

  return '🌌 Night';
}