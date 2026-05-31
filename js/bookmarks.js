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

let bookmarks =
  storage.get(
    STORAGE_KEYS.BOOKMARKS,
    []
  );

let editId = null;

let foldersCollapsed = false;

// =========================================
// ELEMENTS
// =========================================

const form =
  document.getElementById(
    'bookmark-form'
  );

const bookmarkList =
  document.getElementById(
    'bookmark-list'
  );

const filterInput =
  document.getElementById(
    'filter'
  );

const countEl =
  document.getElementById(
    'count'
  );

const clearBtn =
  document.getElementById(
    'bm-clear'
  );

const toggleFoldersBtn =
  document.getElementById(
    'toggle-folders'
  );

// =========================================
// INIT
// =========================================

export function initBookmarks() {

  // ===============================
  // ELEMENT VALIDATION
  // ===============================

  if (
    !form ||
    !bookmarkList
  ) {

    console.error(
      '❌ Bookmark module elements missing'
    );

    return;
  }

  // ===============================
  // INITIAL RENDER
  // ===============================

  renderBookmarks();

  // ===============================
  // EVENTS
  // ===============================

  form.addEventListener(
    'submit',
    handleSubmit
  );

  bookmarkList.addEventListener(
    'click',
    handleBookmarkActions
  );

  filterInput?.addEventListener(
    'input',
    filterBookmarks
  );

  clearBtn?.addEventListener(
    'click',
    clearBookmarks
  );

  toggleFoldersBtn?.addEventListener(
    'click',
    toggleFolders
  );

  console.log(
    '✅ Bookmark Module Ready'
  );
}

// =========================================
// HANDLE FORM SUBMIT
// =========================================

function handleSubmit(event) {

  event.preventDefault();

  const category =
    getInputValue('bm-category');

  const emoji =
    getInputValue('bm-emoji');

  const label =
    getInputValue('bm-label');

  const url =
    getInputValue('bm-url');

  // ===============================
  // VALIDATION
  // ===============================

  if (
    !category ||
    !emoji ||
    !label ||
    !url
  ) {

    alert(
      'Please fill all fields.'
    );

    return;
  }

  // ===============================
  // DUPLICATE CHECK
  // ===============================

  const duplicate =
    bookmarks.find(bookmark =>
      bookmark.url === url &&
      bookmark.id !== editId
    );

  if (duplicate) {

    alert(
      'Bookmark already exists.'
    );

    return;
  }

  // ===============================
  // CREATE BOOKMARK
  // ===============================

  const bookmark = {

    id:
      editId ||
      Date.now(),

    category,

    emoji,

    label,

    url,

    createdAt:
      new Date().toISOString()
  };

  // ===============================
  // UPDATE OR CREATE
  // ===============================

  if (editId) {

    bookmarks = bookmarks.map(item =>
      item.id === editId
        ? bookmark
        : item
    );

    editId = null;
  }

  else {

    bookmarks.push(bookmark);
  }

  // ===============================
  // SAVE + RENDER
  // ===============================

  saveBookmarks();

  renderBookmarks();

  form.reset();
}

// =========================================
// RENDER BOOKMARKS
// =========================================

function renderBookmarks(
  data = bookmarks
) {

  bookmarkList.innerHTML = '';

  // ===============================
  // EMPTY STATE
  // ===============================

  if (!data.length) {

    bookmarkList.innerHTML = `
      <div class="card">
        <p>No bookmarks added yet.</p>
      </div>
    `;

    updateCount(0);

    return;
  }

  // ===============================
  // GROUP BY CATEGORY
  // ===============================

  const grouped = {};

  data.forEach(bookmark => {

    if (
      !grouped[bookmark.category]
    ) {

      grouped[
        bookmark.category
      ] = [];
    }

    grouped[
      bookmark.category
    ].push(bookmark);
  });

  // ===============================
  // RENDER FOLDERS
  // ===============================

  Object.entries(grouped).forEach(

    ([category, items]) => {

      const folder =
        document.createElement('div');

      folder.className =
        'folder';

      folder.innerHTML = `
          <div class="folder-header" draggable="true" data-category="${category}">
            <div class="folder-title-group">
              <div class="folder-drag-handle" title="Drag folder to reorder">☰</div>
              <h3>📁 ${category} (${items.length})</h3>
            </div>

            <div class="folder-actions">
              <button
                data-folder-action="folder-edit"
                id="folder-edit-btn"
                data-category="${category}"
                title="Rename Folder"
              >
                ✏️
              </button>
            </div>
          </div>

          </div>

          <div class="
            folder-content
            ${foldersCollapsed ? 'hidden' : ''}
          ">

            ${items
                  .map(renderBookmarkCard)
                  .join('')}

          </div>
        `;

      bookmarkList.appendChild(
        folder
      );
    }
  );

  updateCount(data.length);
}

// =========================================
// RENDER SINGLE CARD
// =========================================

function renderBookmarkCard(
  bookmark
) {

  const visits =
    getVisitCount(bookmark.url);

  return `
    <div class="link" draggable="true" data-id="${bookmark.id}">
      <div class="bookmark-drag-handle" title="Drag bookmark to reorder">☰</div>
      
      <div class="bookmark-content-core">
        <span>${bookmark.emoji}</span>
        <a
          href="${bookmark.url}"
          target="_blank"
          rel="noopener noreferrer"
          data-visit-url="${bookmark.url}"
          title="${bookmark.url}"
        >
          ${bookmark.label}
        </a>
        <span class="badge">${visits} visits</span>
      </div>

      <div class="bookmark-actions">
        <button
          data-action="edit"
          data-id="${bookmark.id}"
          title="Edit Bookmark"
        >
          ✏️
        </button>
        <button
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

function handleBookmarkActions(
  event
) {

  // ===============================
  // VISIT TRACKING
  // ===============================

  const link =
    event.target.closest('a');

  if (link?.dataset.visitUrl) {

    incrementVisit(
      link.dataset.visitUrl
    );
  }

  // ===============================
  // FOLDER ACTIONS
  // ===============================

  const folderAction =
    event.target.dataset.folderAction;

  const category =
    event.target.dataset.category;

  if (
    folderAction &&
    category
  ) {

    if (
      folderAction === 'folder-edit'
    ) {

      renameFolder(category);
    }

    if (
      folderAction === 'folder-up'
    ) {

      moveFolderUp(category);
    }

    if (
      folderAction === 'folder-down'
    ) {

      moveFolderDown(category);
    }

    return;
  }

  // ===============================
  // ACTION BUTTONS
  // ===============================

  const action =
    event.target.dataset.action;

  const id =
    Number(
      event.target.dataset.id
    );

  if (!action) {
    return;
  }

  if (action === 'edit') {
    editBookmark(id);
  }

  if (action === 'delete') {
    deleteBookmark(id);
  }
  if (action === 'move-up') {
    moveBookmarkUp(id);
  }

  if (action === 'move-down') {
    moveBookmarkDown(id);
  }
}

// =========================================
// EDIT BOOKMARK
// =========================================

function editBookmark(id) {

  const bookmark =
    bookmarks.find(
      item => item.id === id
    );

  if (!bookmark) {
    return;
  }

  setInputValue(
    'bm-category',
    bookmark.category
  );

  setInputValue(
    'bm-emoji',
    bookmark.emoji
  );

  setInputValue(
    'bm-label',
    bookmark.label
  );

  setInputValue(
    'bm-url',
    bookmark.url
  );

  editId = id;

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// =========================================
// DELETE BOOKMARK
// =========================================

function deleteBookmark(id) {

  const confirmDelete =
    confirm(
      'Delete this bookmark?'
    );

  if (!confirmDelete) {
    return;
  }

  bookmarks =
    bookmarks.filter(
      item => item.id !== id
    );

  saveBookmarks();

  renderBookmarks();
}

// =========================================
// FILTER
// =========================================

function filterBookmarks() {

  const query =
    filterInput.value
      .trim()
      .toLowerCase();

  const filtered =
    bookmarks.filter(bookmark =>

      bookmark.label
        .toLowerCase()
        .includes(query)

      ||

      bookmark.category
        .toLowerCase()
        .includes(query)

      ||

      bookmark.url
        .toLowerCase()
        .includes(query)
    );

  renderBookmarks(filtered);
}

// =========================================
// CLEAR ALL
// =========================================

function clearBookmarks() {

  form.reset();

  editId = null;

  console.log(
    '🧹 Bookmark form cleared'
  );
}
// =========================================
// TOGGLE FOLDERS
// =========================================

function toggleFolders() {

  foldersCollapsed =
    !foldersCollapsed;

  renderBookmarks();
}

// =========================================
// SAVE
// =========================================

function saveBookmarks() {

  storage.set(
    STORAGE_KEYS.BOOKMARKS,
    bookmarks
  );
}

// =========================================
// UPDATE COUNT
// =========================================

function updateCount(count) {

  if (!countEl) {
    return;
  }

  countEl.textContent =
    `${count} shown`;
}

// =========================================
// HELPERS
// =========================================

function getInputValue(id) {

  const element =
    document.getElementById(id);

  return element
    ? element.value.trim()
    : '';
}

function setInputValue(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {

    element.value = value;
  }
}

// =========================================
// MOVE BOOKMARK UP
// =========================================

function moveBookmarkUp(id) {

  const index =
    bookmarks.findIndex(
      item => item.id === id
    );

  if (index <= 0) {
    return;
  }

  [
    bookmarks[index - 1],
    bookmarks[index]
  ] = [
      bookmarks[index],
      bookmarks[index - 1]
    ];

  saveBookmarks();

  renderBookmarks();
}

// =========================================
// MOVE BOOKMARK DOWN
// =========================================

function moveBookmarkDown(id) {

  const index =
    bookmarks.findIndex(
      item => item.id === id
    );

  if (
    index === -1 ||
    index >= bookmarks.length - 1
  ) {
    return;
  }

  [
    bookmarks[index],
    bookmarks[index + 1]
  ] = [
      bookmarks[index + 1],
      bookmarks[index]
    ];

  saveBookmarks();

  renderBookmarks();
}

// =========================================
// RENAME FOLDER
// =========================================

function renameFolder(category) {

  const updated =
    prompt(
      'Rename folder:',
      category
    );

  if (!updated) {
    return;
  }

  const trimmed =
    updated.trim();

  if (!trimmed) {
    return;
  }

  bookmarks = bookmarks.map(item => {

    if (
      item.category === category
    ) {

      return {

        ...item,

        category: trimmed
      };
    }

    return item;
  });

  saveBookmarks();

  renderBookmarks();
}

// =========================================
// MOVE FOLDER UP
// =========================================

function moveFolderUp(category) {

  moveFolder(
    category,
    'up'
  );
}

// =========================================
// MOVE FOLDER DOWN
// =========================================

function moveFolderDown(category) {

  moveFolder(
    category,
    'down'
  );
}

// =========================================
// MOVE FOLDER CORE
// =========================================

function moveFolder(
  category,
  direction
) {

  // ===============================
  // UNIQUE CATEGORY ORDER
  // ===============================

  const categories = [

    ...new Set(

      bookmarks.map(
        item => item.category
      )
    )
  ];

  const index =
    categories.indexOf(
      category
    );

  // ===============================
  // EDGE CASES
  // ===============================

  if (
    direction === 'up' &&
    index <= 0
  ) {
    return;
  }

  if (
    direction === 'down' &&
    index >= categories.length - 1
  ) {
    return;
  }

  // ===============================
  // TARGET INDEX
  // ===============================

  const targetIndex =

    direction === 'up'
      ? index - 1
      : index + 1;

  // ===============================
  // SWAP
  // ===============================

  [
    categories[index],
    categories[targetIndex]
  ] = [
      categories[targetIndex],
      categories[index]
    ];

  // ===============================
  // REBUILD BOOKMARK ARRAY
  // ===============================

  const reordered = [];

  categories.forEach(cat => {

    bookmarks
      .filter(
        item =>
          item.category === cat
      )
      .forEach(item => {

        reordered.push(item);
      });
  });

  bookmarks = reordered;

  saveBookmarks();

  renderBookmarks();
}

// ===================================================================
// UNIVERSAL DRAG-AND-DROP MANAGER FOR FOLDERS AND BOOKMARKS
// ===================================================================
let draggedItemType = null; // 'folder' or 'bookmark'
let draggedTargetId = null; // Stores category string or unique numeric ID

// Event listener initialization attached directly inside rendering checks
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

document.addEventListener("dragend", (e) => {
  document.querySelectorAll('.folder, .link').forEach(el => el.classList.remove('dragging'));
  draggedItemType = null;
  draggedTargetId = null;
});

document.addEventListener("dragover", (e) => {
  e.preventDefault(); // Permits drops cleanly across sub-grid rows
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