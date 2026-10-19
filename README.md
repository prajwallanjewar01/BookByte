# 🔖 BookByte Productivity OS

BookByte Productivity OS is a production-ready, client-side personal dashboard and productivity workspace built with pure Vanilla JavaScript (ES6 Modules), semantic HTML5, fluid modern CSS3, and `localStorage` persistence[cite: 2, 6, 10, 11]. It operates entirely inside the browser with zero external frameworks, runtimes, build steps, or cloud dependencies[cite: 2, 6, 10].

---

## 🚀 Complete Feature Breakdown

### 🍅 1. 3D Mechanical Split-Flap Pomodoro Timer
* **Two-Leaf Physical Animation:** Engineered split-flap mechanism where the top leaf rotates down ($0^\circ \to -90^\circ$) and the lower leaf drops down ($90^\circ \to 0^\circ$) with physics-based stopper-pin overshoot and mechanical settling[cite: 11].
* **Selective Digit Updating:** Six independent digit cards (`HH:MM:SS`) animate only the specific numerical places that change during a tick[cite: 10, 11].
* **Dual-Stage Web Audio Synthesis:** Synthesizes realistic mechanical sounds directly in the browser using the Web Audio API—reproducing the latch release click ($t = 0\text{ms}$) followed by the stopper-pin slap ($t = 160\text{ms}$)—with zero external audio file latency.
* **Professional Custom Time Console:**
  * **Direct Column Steppers (`+` / `−`):** Column buttons placed directly above and below each flip-card pair to quickly add or subtract hours, minutes, or seconds.
  * **Interactive Console Inputs:** Dedicated numeric stepper inputs for Hours ($0\text{--}99$), Minutes ($0\text{--}59$), and Seconds ($0\text{--}59$).
  * **Quick-Adjust Pills:** Instant interval adjustment badges (`+15s`, `+1m`, `+5m`, `−5m`) and standard presets (`25m`, `45m`, `60m`).
  * **Live Split-Flap Sync:** Adjusting time immediately updates the mechanical cards with synchronized animation and audio feedback.
  * **Persistent Memory:** Custom intervals automatically save to `localStorage` under `bookbyte-custom-pomodoro-seconds`.
* **Standard Presets:** One-click switches between Focus ($25\text{m}$), Short Break ($5\text{m}$), Long Break ($15\text{m}$), and Custom Mode.
* **Fullscreen Focus Mode:** Distraction-free full-viewport overlay that expands the split-flap clock up to $15\text{rem}$ while dimming surrounding UI widgets[cite: 10, 11].
* **Theme Parity:** Dark mode features high-contrast slate mechanical leaves, while Light mode dynamically maps leaves to ceramic white/soft slate gradients with deep navy digits without harsh darkening artifacts[cite: 11].

---

### 📦 2. Bookmark Data Migration (Import & Export JSON)
* **1-Click JSON Backup Export:** Serializes all bookmarks, metadata, and timestamps into a standardized `.json` file downloaded directly to your local device[cite: 5, 10].
* **Safe Local File Import:** Accepts user-supplied backup files via native file picker with a strict $2\text{ MB}$ file size guard[cite: 5, 10].
* **Schema Validation & XSS Sanitization:** Rejects malformed JSON and sanitizes incoming URLs by stripping dangerous pseudo-protocols (`javascript:`, `data:`, `vbscript:`) and verifying protocol integrity (`http:` / `https:`)[cite: 5].
* **Duplicate Conflict Resolution Modal:**
  * Detects matching URLs via protocol and trailing-slash normalization[cite: 5].
  * Displays a non-blocking dialog showing the incoming bookmark’s emoji, label, and link[cite: 5, 10].
  * Offers individual choices: **Keep Both** (generates fresh ID) or **Ignore (Skip)**[cite: 5, 10].
  * Includes an **"Apply to all remaining duplicates"** batch checkbox to streamline large imports[cite: 5, 10].
* **Event-Driven UI Refresh:** Emits a custom `bookbyte:bookmarks-updated` event to re-render folders and counters immediately without a page refresh[cite: 5, 7].

---

### 📚 3. Smart Bookmark Manager
* **Per-Folder Accordion Toggles (`+` / `−`):** Independent folder collapse buttons positioned next to folder edit controls, supplemented by a global **📁 Toggle Folders** button[cite: 7, 10, 11].
* **Inline Folder Renaming:** Rename any folder category with automatic batch updates across all associated bookmark items[cite: 7].
* **Smooth Edit Workflow:** Clicking edit (`✏️`) populates form inputs, automatically expands the Add Bookmark section if collapsed, scrolls smoothly to the form, and toggles the action button to **"💾 Update Bookmark"**[cite: 7, 10].
* **Real-Time Search Filter:** Sub-string search filter checking bookmark labels, categories, and URLs simultaneously with an active count badge (`X shown`)[cite: 7, 10].
* **Visit Counter:** Tracks click counts per bookmark link stored locally and displayed as an inline badge[cite: 7].
* **Universal Drag-and-Drop:** Reorder individual bookmarks or entire folder structures using HTML5 Drag APIs on desktop and touch coordinates via `document.elementFromPoint` on mobile drag handles (`☰`)[cite: 7, 11].

---

### 📝 4. Tasks & Daily Goals Engine
* **Strict Non-Whitespace Validation:** Uses `/\S/` regular expression verification to block empty strings, single spaces, double spaces, and pure whitespace submissions.
* **Resilient Item Deletion:** Primary deletion resolves by ID with an automated fallback to DOM element indices, ensuring corrupted, untitled, or empty tasks can always be removed cleanly.
* **Multi-Item Daily Goals:** Dedicated section for tracking daily targets with individual inline editing, deletion, and persistent reordering[cite: 2, 10].
* **Touch-Optimized Drag-and-Drop:** Cross-platform reordering using custom touch event listeners attached to `.task-drag-handle`[cite: 2, 11].

---

### 📂 5. Zero-Ghost-Space Section Collapse System
* **CSS Grid Accordion Animation:** Sections collapse and expand smoothly using `grid-template-rows: 0fr` to `1fr` transitions[cite: 11].
* **Zero Ghost Height:** Enforces `min-height: 0` and `overflow: hidden`, resets header bottom margins, and zeroes out inner `.card` paddings to eliminate the dead empty space typical of collapsed grid items[cite: 11].
* **Parent Padding Compaction:** Utilizes the CSS `:has()` pseudo-class to compress section container padding symmetrically down to $1\text{rem}$ when collapsed[cite: 11].
* **Accessible Keyboard Navigation:** Complete keyboard support on headers via `role="button"`, `tabindex="0"`, `aria-expanded`, and animated carets (`▲`)[cite: 10, 11].

---

### 🌍 6. Global Clocks & Timezone Converter
* **Synchronized World Clocks:** Live displays for Indian Standard Time (IST), Central Time (CT), and Coordinated Universal Time (UTC) with real-time day/night phase badges[cite: 10, 11].
* **Bidirectional Time Converter:** Date-time picker with a one-click **Now** button to convert timestamps between IST, CT, and UTC instantly[cite: 10].

---

### 🧠 7. Greeting & Wisdom Engine
* **Time-Aware Salutations:** Adjusts greetings based on user local time (Morning, Afternoon, Evening, Night)[cite: 10].
* **Cached Quotes Engine:** Hourly wisdom refresh cycle with an animated countdown timer and a manual refresh trigger (`🔄`)[cite: 10, 11].

---

## 🎨 Design System & Theme Engine

* **CSS Variable Architecture:** Base design tokens define typography scales, glassmorphism layers, border radii, and z-index layers[cite: 11].
* **Theme Parity:** Toggling the theme button (`🌞` / `🌙`) applies `body.light` to swap colors across components without breaking glassmorphism effects[cite: 10, 11]:
  * **Dark Mode:** Deep obsidian backgrounds (`#05070a`), slate cards with `backdrop-filter: blur(18px)`, and glowing blue neon accents[cite: 11].
  * **Light Mode:** Crisp slate-white surfaces (`#ffffff`), soft borders (`#e2e8f0`), deep navy typography (`#0f172a`), and ceramic flip cards[cite: 11].
* **Fluid Layouts:** Uses CSS `clamp()` and container queries for typography, button sizes, and cards, eliminating abrupt layout shifts across mobile, tablet, and ultra-wide screens[cite: 11].

---

## 💾 Local Storage Data Schema

All state is preserved client-side in the browser's `localStorage`:

| Storage Key | Data Type | Description |
|---|---|---|
| `bookbyte-theme` | `string` | Visual mode preference (`"dark"` or `"light"`). |
| `bookbyte-bookmarks` | `Array<Object>` | Bookmark records: `id`, `category`, `emoji`, `label`, `url`, `visits`, `createdAt`[cite: 5, 7]. |
| `tasks` | `Array<Object>` | Task records: `id`, `text`, `completed`, `createdAt`[cite: 2]. |
| `dailyGoalsList` | `Array<Object>` | Daily goal targets: `id`, `text`, `createdAt`[cite: 2]. |
| `bookbyte-custom-pomodoro-seconds` | `number` | User-defined custom duration for the Pomodoro timer in seconds. |
| `bookbyte-custom-pomodoro` | `number` | Legacy/fallback custom Pomodoro duration in minutes. |
| `bookbyte-quote-cache` | `Object` | Cached quote payload: quote text, author, and retrieval timestamp. |

---

## 📂 Project Architecture

```text
bookbyte/
├── index.html              # Semantic HTML5 markup, accessible headers, modals[cite: 10]
├── README.md               # Documentation and technical specifications
├── css/
│   ├── base.css            # Root design tokens, CSS variables, fluid typography scale
│   ├── layout.css          # Viewport layouts, macro-grids, and breakpoint rules
│   ├── components.css      # Component cards, 3D flip clock, custom steppers, zero-ghost collapse[cite: 11]
│   └── themes.css          # Light theme variable mappings and overrides
└── js/
    ├── app.js              # Application bootstrapper and lifecycle safeInit coordinator[cite: 6, 8]
    ├── storage.js          # Unified localStorage wrapper and visit tracking utilities[cite: 2, 7]
    ├── theme.js            # Theme toggle management and meta theme-color sync
    ├── collapse.js         # Accessible accordion click and keyboard listeners
    ├── pomodoro.js         # 3D mechanical split-flap engine, custom console, and Web Audio synthesis
    ├── bookmarks.js        # Bookmark folders, +/- accordions, search, and touch/mouse drag-and-drop[cite: 7]
    ├── bookmark-backup.js  # JSON import/export controller, XSS sanitizer, and conflict modal[cite: 5]
    ├── tasks.js            # Tasks and daily goals with non-whitespace regex validation[cite: 2]
    ├── clocks.js           # Multi-timezone world clocks with day-phase calculations
    ├── converter.js        # Timezone converter calculation engine
    └── quotes.js           # Dynamic quote rotation and countdown timer