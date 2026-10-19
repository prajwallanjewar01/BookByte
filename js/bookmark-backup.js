/**
 * ===================================================================
 * bookmark-backup.js
 * Production-Ready Import & Export Controller for Bookmarks
 * ===================================================================
 */

import { storage } from "./storage.js";

const BOOKMARKS_KEY = "bookbyte-bookmarks";
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB limit

export function initBookmarkBackup() {
  const exportBtn = document.getElementById("bm-export-btn");
  const importBtn = document.getElementById("bm-import-btn");
  const fileInput = document.getElementById("bm-file-input");

  if (!exportBtn || !importBtn || !fileInput) {
    console.warn("⚠️ Bookmark backup elements missing");
    return;
  }

  exportBtn.addEventListener("click", exportBookmarksJSON);
  importBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFileImport);
}

/**
 * Serializes bookmarks and triggers a browser file download
 */
function exportBookmarksJSON() {
  const bookmarks = storage.get(BOOKMARKS_KEY, []);

  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    alert("No bookmarks found to export.");
    return;
  }

  const exportPayload = {
    app: "BookByte Productivity OS",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    totalBookmarks: bookmarks.length,
    bookmarks: bookmarks
  };

  try {
    const dataString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([dataString], { type: "application/json;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    anchor.href = downloadUrl;
    anchor.download = `bookbyte-bookmarks-${dateStamp}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Export failure:", error);
    alert("Failed to create export file.");
  }
}

/**
 * Handles file reading, schema validation, and duplicate conflict prompts
 */
async function handleFileImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 1. File Size Verification
  if (file.size > MAX_FILE_SIZE_BYTES) {
    alert("File exceeds maximum allowed limit of 2 MB.");
    event.target.value = "";
    return;
  }

  // 2. MIME / Extension Verification
  if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
    alert("Please select a valid JSON file.");
    event.target.value = "";
    return;
  }

  try {
    const fileContent = await file.text();
    const parsedData = JSON.parse(fileContent);

    // Support both raw arrays and metadata-wrapped payloads
    const incomingItems = Array.isArray(parsedData)
      ? parsedData
      : Array.isArray(parsedData.bookmarks)
      ? parsedData.bookmarks
      : null;

    if (!incomingItems) {
      alert("Invalid format: The file must contain a bookmark array.");
      event.target.value = "";
      return;
    }

    // 3. Schema & Protocol Sanitization
    const validCandidates = [];
    for (const item of incomingItems) {
      if (isValidBookmarkSchema(item)) {
        validCandidates.push({
          id: item.id || Date.now() + Math.floor(Math.random() * 10000),
          category: String(item.category || "General").trim(),
          emoji: String(item.emoji || "🔖").trim().slice(0, 2),
          label: String(item.label || "Untitled").trim(),
          url: sanitizeURL(item.url),
          visits: Number(item.visits) || 0,
          createdAt: item.createdAt || new Date().toISOString()
        });
      }
    }

    if (validCandidates.length === 0) {
      alert("No valid bookmarks found in the imported file.");
      event.target.value = "";
      return;
    }

    // 4. Duplicate Processing Engine
    const currentBookmarks = storage.get(BOOKMARKS_KEY, []);
    const existingUrlSet = new Set(currentBookmarks.map(bm => normalizeURL(bm.url)));

    const bookmarksToAdd = [];
    let skippedCount = 0;
    let globalDecision = null;

    for (const candidate of validCandidates) {
      const normalizedCandidateUrl = normalizeURL(candidate.url);
      const isDuplicate = existingUrlSet.has(normalizedCandidateUrl);

      if (isDuplicate) {
        let decision = globalDecision;

        if (!decision) {
          const userChoice = await promptDuplicateResolution(candidate);
          decision = userChoice.action;
          if (userChoice.applyToAll) {
            globalDecision = decision;
          }
        }

        if (decision === "keep") {
          candidate.id = Date.now() + Math.floor(Math.random() * 100000);
          bookmarksToAdd.push(candidate);
        } else {
          skippedCount++;
        }
      } else {
        bookmarksToAdd.push(candidate);
        existingUrlSet.add(normalizedCandidateUrl);
      }
    }

    // 5. Commit to Storage and Dispatch UI Update
    if (bookmarksToAdd.length > 0) {
      const consolidated = [...currentBookmarks, ...bookmarksToAdd];
      storage.set(BOOKMARKS_KEY, consolidated);
      document.dispatchEvent(new CustomEvent("bookbyte:bookmarks-updated"));
    }

    alert(
      `Import complete!\n• Added: ${bookmarksToAdd.length}\n• Skipped (Duplicates): ${skippedCount}`
    );
  } catch (error) {
    console.error("Import processing error:", error);
    alert("Error reading file: " + error.message);
  } finally {
    event.target.value = "";
  }
}

function normalizeURL(url) {
  try {
    const parsed = new URL(url);
    return (parsed.origin + parsed.pathname).toLowerCase().replace(/\/+$/, "");
  } catch {
    return String(url || "").trim().toLowerCase().replace(/\/+$/, "");
  }
}

function sanitizeURL(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    // Fall through
  }
  return "https://" + url.replace(/^[a-zA-Z]+:\/\//, "");
}

function isValidBookmarkSchema(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.url !== "string" || !item.url.trim()) return false;
  if (typeof item.label !== "string" || !item.label.trim()) return false;
  return true;
}

function promptDuplicateResolution(bookmark) {
  return new Promise((resolve) => {
    const modal = document.getElementById("conflict-modal");
    const labelEl = document.getElementById("conflict-label");
    const urlEl = document.getElementById("conflict-url");
    const emojiEl = document.getElementById("conflict-emoji");
    const applyAllCheckbox = document.getElementById("conflict-apply-all");
    const ignoreBtn = document.getElementById("conflict-ignore-btn");
    const keepBtn = document.getElementById("conflict-keep-btn");

    labelEl.textContent = bookmark.label;
    urlEl.textContent = bookmark.url;
    emojiEl.textContent = bookmark.emoji || "🔖";
    applyAllCheckbox.checked = false;

    modal.classList.remove("hidden");

    function cleanup(action) {
      const applyToAll = applyAllCheckbox.checked;
      modal.classList.add("hidden");
      ignoreBtn.removeEventListener("click", onIgnore);
      keepBtn.removeEventListener("click", onKeep);
      resolve({ action, applyToAll });
    }

    function onIgnore() { cleanup("ignore"); }
    function onKeep() { cleanup("keep"); }

    ignoreBtn.addEventListener("click", onIgnore);
    keepBtn.addEventListener("click", onKeep);
  });
}