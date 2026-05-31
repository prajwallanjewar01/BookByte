// =========================================
// STORAGE KEYS
// =========================================

export const STORAGE_KEYS = {

  THEME: 'bookbyte-theme',

  BOOKMARKS: 'bookbyte-bookmarks',

  TASKS: 'bookbyte-tasks',

  DAILY_GOAL: 'bookbyte-daily-goal',

  QUOTE_CACHE: 'bookbyte-quote-cache',

  VISITS: 'bookbyte-visit-history'
};

// =========================================
// SAFE STORAGE WRAPPER
// =========================================

export const storage = {

  // =====================================
  // GET
  // =====================================

  get(key, fallback = null) {

    try {

      const rawData =
        localStorage.getItem(key);

      // ===============================
      // NO DATA
      // ===============================

      if (rawData === null) {

        return fallback;
      }

      // ===============================
      // PARSE JSON
      // ===============================

      return JSON.parse(rawData);

    }

    catch (error) {

      console.error(
        `❌ Storage GET failed (${key})`,
        error
      );

      return fallback;
    }
  },

  // =====================================
  // SET
  // =====================================

  set(key, value) {

    try {

      const serialized =
        JSON.stringify(value);

      localStorage.setItem(
        key,
        serialized
      );

      return true;

    }

    catch (error) {

      console.error(
        `❌ Storage SET failed (${key})`,
        error
      );

      return false;
    }
  },

  // =====================================
  // REMOVE
  // =====================================

  remove(key) {

    try {

      localStorage.removeItem(key);

      return true;

    }

    catch (error) {

      console.error(
        `❌ Storage REMOVE failed (${key})`,
        error
      );

      return false;
    }
  },

  // =====================================
  // CLEAR ALL
  // =====================================

  clearAll() {

    try {

      localStorage.clear();

      console.log(
        '🧹 LocalStorage Cleared'
      );

      return true;

    }

    catch (error) {

      console.error(
        '❌ Storage CLEAR failed',
        error
      );

      return false;
    }
  },

  // =====================================
  // EXISTS
  // =====================================

  exists(key) {

    return (
      localStorage.getItem(key) !== null
    );
  }
};

// =========================================
// STORAGE UTILITIES
// =========================================

export function incrementVisit(url) {

  const visits =
    storage.get(
      STORAGE_KEYS.VISITS,
      {}
    );

  visits[url] =
    (visits[url] || 0) + 1;

  storage.set(
    STORAGE_KEYS.VISITS,
    visits
  );
}

export function getVisitCount(url) {

  const visits =
    storage.get(
      STORAGE_KEYS.VISITS,
      {}
    );

  return visits[url] || 0;
}

// =========================================
// STORAGE HEALTH CHECK
// =========================================

export function checkStorageAvailability() {

  try {

    const testKey =
      '__bookbyte_test__';

    localStorage.setItem(
      testKey,
      'test'
    );

    localStorage.removeItem(
      testKey
    );

    console.log(
      '✅ LocalStorage Available'
    );

    return true;

  }

  catch (error) {

    console.error(
      '❌ LocalStorage Not Available',
      error
    );

    return false;
  }
}