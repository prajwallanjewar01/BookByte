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

const greetingText =
  document.getElementById(
    'greeting-text'
  );

const quoteText =
  document.getElementById(
    'quote-text'
  );

const quoteAuthor =
  document.getElementById(
    'quote-author'
  );

const quoteCountdown =
  document.getElementById(
    'quote-countdown'
  );

const newQuoteBtn =
  document.getElementById(
    'new-quote-btn'
  );

// =========================================
// CONFIG
// =========================================

const QUOTE_REFRESH_SECONDS = 3600;

let countdown =
  QUOTE_REFRESH_SECONDS;

let countdownInterval = null;

// =========================================
// FALLBACK QUOTES
// =========================================

const fallbackQuotes = [

  {
    quote:
      'Discipline equals freedom.',
    author:
      'Jocko Willink'
  },

  {
    quote:
      'Focus on consistency over intensity.',
    author:
      'Unknown'
  },

  {
    quote:
      'Small progress every day adds up to big results.',
    author:
      'Unknown'
  },

  {
    quote:
      'Deep work creates extraordinary outcomes.',
    author:
      'Cal Newport'
  },

  {
    quote:
      'Your future is created by your daily habits.',
    author:
      'James Clear'
  }
];

// =========================================
// INIT
// =========================================

export function initQuotes() {

  // ===============================
  // ELEMENT VALIDATION
  // ===============================

  if (
    !greetingText ||
    !quoteText ||
    !quoteAuthor
  ) {

    console.error(
      '❌ Quotes module elements missing'
    );

    return;
  }

  // ===============================
  // GREETING
  // ===============================

  updateGreeting();

  // ===============================
  // LOAD QUOTE
  // ===============================

  loadInitialQuote();

  // ===============================
  // BUTTON EVENT
  // ===============================

  newQuoteBtn?.addEventListener(
    'click',
    handleManualRefresh
  );

  // ===============================
  // START TIMER
  // ===============================

  startCountdown();

  console.log(
    '✅ Quotes Module Ready'
  );
}

// =========================================
// GREETING SYSTEM
// =========================================

function updateGreeting() {

  const hour =
    new Date().getHours();

  let greeting = '';

  if (hour < 12) {

    greeting =
      'Good Morning ☀️';
  }

  else if (hour < 17) {

    greeting =
      'Good Afternoon 🌤️';
  }

  else if (hour < 21) {

    greeting =
      'Good Evening 🌙';
  }

  else {

    greeting =
      'Good Night 🌌';
  }

  greetingText.textContent =
    greeting;
}

// =========================================
// INITIAL LOAD
// =========================================

async function loadInitialQuote() {

  const cached =
    storage.get(
      STORAGE_KEYS.QUOTE_CACHE,
      null
    );

  // ===============================
  // USE CACHE
  // ===============================

  if (
    cached &&
    cached.quote
  ) {

    renderQuote(
      cached.quote,
      cached.author
    );
  }

  // ===============================
  // FETCH NEW
  // ===============================

  else {

    await fetchQuote();
  }
}

// =========================================
// FETCH QUOTE
// =========================================

async function fetchQuote() {

  try {

    setLoadingState();

    // ===============================
    // FETCH API
    // ===============================

    const response =
      await fetch(
        'https://api.quotable.io/random'
      );

    if (!response.ok) {

      throw new Error(
        'Quote API failed'
      );
    }

    const data =
      await response.json();

    const quote =
      data.content;

    const author =
      data.author;

    // ===============================
    // VALIDATE
    // ===============================

    if (!quote) {

      throw new Error(
        'Invalid quote data'
      );
    }

    // ===============================
    // RENDER
    // ===============================

    renderQuote(
      quote,
      author
    );

    // ===============================
    // CACHE
    // ===============================

    storage.set(
      STORAGE_KEYS.QUOTE_CACHE,
      {

        quote,

        author,

        timestamp:
          Date.now()
      }
    );

    console.log(
      '✅ Quote fetched'
    );
  }

  catch (error) {

    console.error(
      '❌ Quote fetch failed',
      error
    );

    loadFallbackQuote();
  }
}

// =========================================
// FALLBACK
// =========================================

function loadFallbackQuote() {

  const randomQuote =
    fallbackQuotes[
      Math.floor(
        Math.random() *
        fallbackQuotes.length
      )
    ];

  renderQuote(
    randomQuote.quote,
    randomQuote.author
  );
}

// =========================================
// RENDER
// =========================================

function renderQuote(
  quote,
  author
) {

  quoteText.textContent =
    `"${quote}"`;

  quoteAuthor.textContent =
    `— ${author}`;
}

// =========================================
// LOADING STATE
// =========================================

function setLoadingState() {

  quoteText.textContent =
    'Fetching wisdom...';

  quoteAuthor.textContent =
    '...';
}

// =========================================
// MANUAL REFRESH
// =========================================

async function handleManualRefresh() {

  countdown =
    QUOTE_REFRESH_SECONDS;

  await fetchQuote();
}

// =========================================
// COUNTDOWN
// =========================================

function startCountdown() {

  updateCountdownUI();

  // ===============================
  // PREVENT DUPLICATE INTERVALS
  // ===============================

  if (countdownInterval) {

    clearInterval(
      countdownInterval
    );
  }

  countdownInterval =
    setInterval(async () => {

      countdown--;

      // ===========================
      // AUTO REFRESH
      // ===========================

      if (countdown <= 0) {

        countdown =
          QUOTE_REFRESH_SECONDS;

        await fetchQuote();
      }

      updateCountdownUI();

    }, 1000);
}

// =========================================
// UPDATE TIMER UI
// =========================================

function updateCountdownUI() {

  if (!quoteCountdown) {
    return;
  }

  const minutes =
    String(
      Math.floor(
        countdown / 60
      )
    ).padStart(2, '0');

  const seconds =
    String(
      countdown % 60
    ).padStart(2, '0');

  quoteCountdown.textContent =
    `${minutes}:${seconds}`;
}