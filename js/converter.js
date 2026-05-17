// =========================================
// ELEMENTS
// =========================================

const timeInput =
  document.getElementById(
    'time-input'
  );

const fromTimezone =
  document.getElementById(
    'from-tz'
  );

const toTimezone =
  document.getElementById(
    'to-tz'
  );

const convertBtn =
  document.getElementById(
    'convert-btn'
  );

const nowBtn =
  document.getElementById(
    'now-btn'
  );

const output =
  document.getElementById(
    'time-output'
  );

// =========================================
// INIT
// =========================================

export function initConverter() {

  // ===============================
  // ELEMENT VALIDATION
  // ===============================

  if (
    !timeInput ||
    !fromTimezone ||
    !toTimezone ||
    !convertBtn ||
    !output
  ) {

    console.error(
      '❌ Converter module elements missing'
    );

    return;
  }

  // ===============================
  // SET CURRENT TIME
  // ===============================

  setCurrentTime();

  // ===============================
  // EVENTS
  // ===============================

  convertBtn.addEventListener(
    'click',
    convertTime
  );

  nowBtn?.addEventListener(
    'click',
    handleNowButton
  );

  timeInput.addEventListener(
    'change',
    convertTime
  );

  fromTimezone.addEventListener(
    'change',
    convertTime
  );

  toTimezone.addEventListener(
    'change',
    convertTime
  );

  console.log(
    '✅ Converter Module Ready'
  );
}

// =========================================
// CONVERT TIME
// =========================================

function convertTime() {

  try {

    const inputValue =
      timeInput.value;

    const fromTZ =
      fromTimezone.value;

    const toTZ =
      toTimezone.value;

    // ===============================
    // VALIDATION
    // ===============================

    if (!inputValue) {

      output.textContent =
        'Please select date and time.';

      return;
    }

    // ===============================
    // PARSE DATE
    // ===============================

    const inputDate =
      new Date(inputValue);

    if (
      isNaN(inputDate.getTime())
    ) {

      output.textContent =
        'Invalid date/time input.';

      return;
    }

    // ===============================
    // CONVERT TIME
    // ===============================

    const converted =
      new Intl.DateTimeFormat(
        'en-US',
        {

          timeZone: toTZ,

          weekday: 'short',

          year: 'numeric',

          month: 'short',

          day: 'numeric',

          hour: '2-digit',

          minute: '2-digit',

          second: '2-digit',

          hour12: true
        }
      ).format(inputDate);

    // ===============================
    // FORMAT LABELS
    // ===============================

    const fromLabel =
      getTimezoneLabel(fromTZ);

    const toLabel =
      getTimezoneLabel(toTZ);

    // ===============================
    // OUTPUT
    // ===============================

    output.innerHTML = `
      <div class="conversion-result">

        <p>
          <strong>From:</strong>
          ${fromLabel}
        </p>

        <p>
          <strong>To:</strong>
          ${toLabel}
        </p>

        <h3>
          ${converted}
        </h3>

      </div>
    `;
  }

  catch (error) {

    console.error(
      '❌ Time conversion failed',
      error
    );

    output.textContent =
      'Conversion failed.';
  }
}

// =========================================
// NOW BUTTON
// =========================================

function handleNowButton() {

  setCurrentTime();

  convertTime();
}

// =========================================
// SET CURRENT LOCAL TIME
// =========================================

function setCurrentTime() {

  const now =
    new Date();

  // ===============================
  // LOCAL ISO FORMAT
  // ===============================

  const localISO =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() * 60000
    )
    .toISOString()
    .slice(0, 16);

  timeInput.value =
    localISO;
}

// =========================================
// LABEL HELPER
// =========================================

function getTimezoneLabel(timezone) {

  const labels = {

    'Asia/Kolkata':
      'IST (India)',

    'America/Chicago':
      'CT (Central Time)',

    'UTC':
      'UTC'
  };

  return (
    labels[timezone] ||
    timezone
  );
}