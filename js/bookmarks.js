// =========================================
// IMPORTS
// =========================================
import {
  storage,
  STORAGE_KEYS,
  incrementVisit,
  getVisitCount
} from './storage.js';

// =========================================
// STATE
// =========================================
let bookmarks = storage.get(STORAGE_KEYS.BOOKMARKS, []);
let editId = null;

// Track individually collapsed folder categories
let collapsedFolders = new Set();

// =========================================
// DOM ELEMENTS
// =========================================
const form = document.getElementById('bookmark-form');
const bookmarkList = document.getElementById('bookmark-list');
const filterInput = document.getElementById('filter');
const countEl = document.getElementById('count');
const clearBtn = document.getElementById('bm-clear');
const toggleFoldersBtn = document.getElementById('toggle-folders');

// =========================================
// INIT
// =========================================
export function initBookmarks() {
  if (!form || !bookmarkList) {
    console.error('❌ Bookmark module elements missing');
    return;
  }

  renderBookmarks();

  // Primary Event Listeners
  form.addEventListener('submit', handleSubmit);
  bookmarkList.addEventListener('click', handleBookmarkActions);
  filterInput?.addEventListener('input', filterBookmarks);
  clearBtn?.addEventListener('click', clearBookmarks);
  toggleFoldersBtn?.addEventListener('click', toggleAllFolders);

  // Sync with Import/Export engine
  document.addEventListener("bookbyte:bookmarks-updated", () => {
    bookmarks = storage.get("bookbyte-bookmarks", []);
    renderBookmarks();
    updateCount(bookmarks.length);
  });

  console.log('✅ Bookmark Module Ready');
}

// =========================================
// HANDLE FORM SUBMIT
// =========================================
function handleSubmit(event) {
  event.preventDefault();

  const category = getInputValue('bm-category');
  const emoji = getInputValue('bm-emoji');
  const label = getInputValue('bm-label');
  const url = getInputValue('bm-url');

  if (!category || !emoji || !label || !url) {
    alert('Please fill all fields.');
    return;
  }

  const duplicate = bookmarks.find(
    b => b.url.toLowerCase() === url.toLowerCase() && b.id !== editId
  );

  if (duplicate) {
    alert('A bookmark with this URL already exists in "' + duplicate.category + '".');
    return;
  }

  const bookmark = {
    id: editId || Date.now(),
    category,
    emoji,
    label,
    url,
    createdAt: new Date().toISOString()
  };

  if (editId) {
    bookmarks = bookmarks.map(item => (item.id === editId ? bookmark : item));
    editId = null;
    resetSubmitButton();
  } else {
    bookmarks.push(bookmark);
  }

  saveBookmarks();
  renderBookmarks();
  form.reset();
}

// =========================================
// RENDER BOOKMARKS
// =========================================
function renderBookmarks(data = bookmarks) {
  bookmarkList.innerHTML = '';

  if (!data.length) {
    bookmarkList.innerHTML = `
      <div class="card" style="text-align: center; padding: 2rem;">
        <p style="color: var(--text-muted); margin: 0;">No bookmarks found.</p>
      </div>
    `;
    updateCount(0);
    return;
  }

  const grouped = {};
  data.forEach(bm => {
    if (!grouped[bm.category]) {
      grouped[bm.category] = [];
    }
    grouped[bm.category].push(bm);
  });

  Object.entries(grouped).forEach(([category, items]) => {
    const isCollapsed = collapsedFolders.has(category);
    const folder = document.createElement('div');
    folder.className = 'folder';

    folder.innerHTML = `
      <div class="folder-header" draggable="true" data-category="${escapeHTML(category)}">
        <div class="folder-title-group">
          <div class="folder-drag-handle" title="Drag folder to reorder">☰</div>
          <h3 
            data-folder-action="toggle-folder" 
            data-category="${escapeHTML(category)}"
            class="folder-title-text"
            title="Click to toggle folder"
          >
            📁 ${escapeHTML(category)} (${items.length})
          </h3>
        </div>

        <div class="folder-actions">
          <button
            type="button"
            data-folder-action="folder-edit"
            data-category="${escapeHTML(category)}"
            title="Rename Folder"
          >
            ✏️
          </button>
          <button
            type="button"
            class="folder-collapse-btn"
            data-folder-action="toggle-folder"
            data-category="${escapeHTML(category)}"
            title="${isCollapsed ? 'Expand folder' : 'Collapse folder'}"
            aria-expanded="${!isCollapsed}"
          >
            ${isCollapsed ? '+' : '−'}
          </button>
        </div>
      </div>

      <div class="folder-content ${isCollapsed ? 'hidden' : ''}">
        ${items.map(renderBookmarkCard).join('')}
      </div>
    `;

    bookmarkList.appendChild(folder);
  });

  updateCount(data.length);
}

// =========================================
// RENDER SINGLE CARD
// =========================================
function renderBookmarkCard(bookmark) {
  const visits = getVisitCount(bookmark.url);

  return `
    <div class="link" draggable="true" data-id="${bookmark.id}">
      <div class="bookmark-drag-handle" title="Drag bookmark to reorder">☰</div>
      
      <div class="bookmark-content-core">
        <span>${escapeHTML(bookmark.emoji)}</span>
        <a
          href="${escapeHTML(bookmark.url)}"
          target="_blank"
          rel="noopener noreferrer"
          data-visit-url="${escapeHTML(bookmark.url)}"
          title="${escapeHTML(bookmark.url)}"
        >
          ${escapeHTML(bookmark.label)}
        </a>
        <span class="badge">${visits} visits</span>
      </div>

      <div class="bookmark-actions">
        <button
          type="button"
          data-action="edit"
          data-id="${bookmark.id}"
          title="Edit Bookmark"
        >
          ✏️
        </button>
        <button
          type="button"
          data-action="delete"
          data-id="${bookmark.id}"
          title="Delete Bookmark"
        >
          🗑️
        </button>
      </div>
    </div>
  `;
}

// =========================================
// HANDLE ACTIONS
// =========================================
function handleBookmarkActions(event) {
  const link = event.target.closest('a[data-visit-url]');
  if (link) {
    incrementVisit(link.dataset.visitUrl);
  }

  const folderActionTrigger = event.target.closest('[data-folder-action]');
  if (folderActionTrigger) {
    const action = folderActionTrigger.dataset.folderAction;
    const category = folderActionTrigger.dataset.category;

    if (action === 'toggle-folder') {
      toggleSingleFolder(category);
      return;
    }
    if (action === 'folder-edit') {
      renameFolder(category);
      return;
    }
  }

  const btn = event.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);

  if (action === 'edit') editBookmark(id);
  if (action === 'delete') deleteBookmark(id);
}

// =========================================
// EDIT BOOKMARK (SCROLLS TO FORM SECTION)
// =========================================
function editBookmark(id) {
  const bookmark = bookmarks.find(item => item.id === id);
  if (!bookmark) return;

  setInputValue('bm-category', bookmark.category);
  setInputValue('bm-emoji', bookmark.emoji);
  setInputValue('bm-label', bookmark.label);
  setInputValue('bm-url', bookmark.url);

  editId = id;

  // 1. Auto-expand the Add/Update Bookmark section if collapsed
  const addSection = form.closest('.section');
  const addHeader = addSection?.querySelector('.section-header[role="button"]');
  if (addHeader && addHeader.getAttribute('aria-expanded') === 'false') {
    addHeader.click();
  }

  // 2. Scroll smoothly to the form inputs
  form.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

  // 3. Highlight button to show active edit state
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = '💾 Update Bookmark';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-warning');
  }

  setTimeout(() => {
    document.getElementById('bm-label')?.focus();
  }, 350);
}

function resetSubmitButton() {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = 'Add / Update';
    submitBtn.classList.remove('btn-warning');
    submitBtn.classList.add('btn-primary');
  }
}

// =========================================
// DELETE BOOKMARK
// =========================================
function deleteBookmark(id) {
  const confirmDelete = confirm('Delete this bookmark?');
  if (!confirmDelete) return;

  bookmarks = bookmarks.filter(item => item.id !== id);
  saveBookmarks();
  renderBookmarks();

  if (editId === id) {
    clearBookmarks();
  }
}

// =========================================
// FOLDER ACCORDION TOGGLES (+ / −)
// =========================================
function toggleSingleFolder(category) {
  if (collapsedFolders.has(category)) {
    collapsedFolders.delete(category);
  } else {
    collapsedFolders.add(category);
  }
  renderBookmarks();
}

function toggleAllFolders() {
  const allCategories = [...new Set(bookmarks.map(b => b.category))];
  
  if (collapsedFolders.size >= allCategories.length) {
    collapsedFolders.clear();
  } else {
    allCategories.forEach(cat => collapsedFolders.add(cat));
  }

  renderBookmarks();
}

// =========================================
// SEARCH FILTER
// =========================================
function filterBookmarks() {
  const query = filterInput.value.trim().toLowerCase();

  if (!query) {
    renderBookmarks(bookmarks);
    return;
  }

  const filtered = bookmarks.filter(
    b =>
      b.label.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      b.url.toLowerCase().includes(query)
  );

  renderBookmarks(filtered);
}

// =========================================
// CLEAR / RESET FORM
// =========================================
function clearBookmarks() {
  form.reset();
  editId = null;
  resetSubmitButton();
}

// =========================================
// RENAME FOLDER
// =========================================
function renameFolder(category) {
  const updated = prompt('Rename folder:', category);
  if (updated === null) return;

  const trimmed = updated.trim();
  if (!trimmed) {
    alert('Folder name cannot be empty.');
    return;
  }

  bookmarks = bookmarks.map(item => {
    if (item.category === category) {
      return { ...item, category: trimmed };
    }
    return item;
  });

  if (collapsedFolders.has(category)) {
    collapsedFolders.delete(category);
    collapsedFolders.add(trimmed);
  }

  saveBookmarks();
  renderBookmarks();
}

// =========================================
// STORAGE & UTILITIES
// =========================================
function saveBookmarks() {
  storage.set(STORAGE_KEYS.BOOKMARKS, bookmarks);
}

function updateCount(count) {
  if (countEl) {
    countEl.textContent = `${count} shown`;
  }
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===================================================================
// DRAG AND DROP HANDLERS
// ===================================================================
let draggedItemType = null;
let draggedTargetId = null;

document.addEventListener("dragstart", (e) => {
  const folderHeader = e.target.closest('.folder-header');
  const bookmarkCard = e.target.closest('.link');

  if (folderHeader) {
    draggedItemType = 'folder';
    draggedTargetId = folderHeader.dataset.category;
    folderHeader.parentElement.classList.add('dragging');
  } else if (bookmarkCard) {
    draggedItemType = 'bookmark';
    draggedTargetId = Number(bookmarkCard.dataset.id);
    bookmarkCard.classList.add('dragging');
  }
});

document.addEventListener("dragend", () => {
  document.querySelectorAll('.folder, .link').forEach(el => el.classList.remove('dragging'));
  draggedItemType = null;
  draggedTargetId = null;
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.addEventListener("drop", (e) => {
  if (draggedItemType === 'folder') {
    const targetHeader = e.target.closest('.folder-header');
    if (targetHeader && targetHeader.dataset.category !== draggedTargetId) {
      moveFolder(draggedTargetId, targetHeader.dataset.category);
    }
  } else if (draggedItemType === 'bookmark') {
    const targetCard = e.target.closest('.link');
    if (targetCard && Number(targetCard.dataset.id) !== draggedTargetId) {
      const sourceIndex = bookmarks.findIndex(b => b.id === draggedTargetId);
      const targetIndex = bookmarks.findIndex(b => b.id === Number(targetCard.dataset.id));

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [moved] = bookmarks.splice(sourceIndex, 1);
        bookmarks.splice(targetIndex, 0, moved);
        saveBookmarks();
        renderBookmarks();
      }
    }
  }
});

function moveFolder(fromCat, toCat) {
  const categories = [...new Set(bookmarks.map(item => item.category))];
  const fromIdx = categories.indexOf(fromCat);
  const toIdx = categories.indexOf(toCat);

  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

  const [movedCat] = categories.splice(fromIdx, 1);
  categories.splice(toIdx, 0, movedCat);

  const reordered = [];
  categories.forEach(cat => {
    bookmarks.filter(b => b.category === cat).forEach(b => reordered.push(b));
  });

  bookmarks = reordered;
  saveBookmarks();
  renderBookmarks();
}