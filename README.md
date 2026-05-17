# 🌐 BookByte Productivity OS

A fully interactive browser-based productivity dashboard that combines bookmarks, clocks, task management, focus tools, motivational widgets, and time utilities into one unified workspace.

Built using **Vanilla HTML, CSS, and JavaScript**, BookByte behaves like a lightweight personal productivity operating system directly inside the browser — with full offline persistence using `localStorage`.

---

# 🚀 Live Features

## 🎨 Dual Theme System
- Dark / Light mode support
- Smooth theme switching
- Theme persistence using localStorage
- CSS variables architecture for scalable theming

---

## ⏰ Multi-Timezone Live Clocks

Real-time live clocks for:
- 🇮🇳 IST (India)
- 🇺🇸 CT (Central Time)
- 🌍 UTC

Features:
- Auto-updating every second
- Dynamic date rendering
- Day phase detection:
  - Morning
  - Afternoon
  - Evening
  - Night
- Responsive adaptive clock layout

---

## 📚 Smart Bookmark Manager

Production-style bookmark organization system.

### Features
- Add bookmarks
- Edit bookmarks
- Delete bookmarks
- Move bookmark up/down
- Group by folders/categories
- Rename folders
- Move folders up/down
- Search/filter bookmarks
- Toggle folder collapse
- Visit analytics tracking
- Duplicate URL prevention
- Local persistence
- Hover interactions
- Drag-friendly UI

### Bookmark Fields
- Category
- Emoji
- Label
- URL

---

## 🔍 Smart Search & Filtering
- Real-time bookmark filtering
- Instant DOM updates
- Live bookmark count indicator
- Search by:
  - Name
  - URL
  - Category

---

## 🧠 Greeting & Motivation Engine

### Dynamic Greeting System
Automatically changes based on time:
- ☀️ Morning
- 🌤 Afternoon
- 🌙 Evening
- 🌑 Night

### Motivational Quotes
- Fetch API powered quote system
- Offline fallback quotes
- Cached quotes using localStorage
- Manual refresh button
- Auto-refresh every hour
- Countdown timer until next quote refresh

---

## 🍅 Pomodoro Productivity Timer

### Features
- Focus mode
- Break mode
- Start / Reset / Switch controls
- Audio completion alert
- Productivity workflow support
- Persistent clean timer UI

Default Modes:
- 25 min focus
- 5 min break

---

## 📝 Advanced Task Manager

### Features
- Add tasks
- Delete tasks
- Move task up/down
- Drag-ready structure
- Persistent localStorage saving
- Responsive task layout

---

## 🎯 Daily Goal Tracker

### Features
- Save one primary daily goal
- Persistent across refresh
- Productivity intention tracking
- Minimal distraction workflow

---

## ⏱️ Timezone Converter

Convert between:
- IST
- CT
- UTC

### Features
- Live datetime input
- Instant conversion
- “Now” button
- Responsive converter UI
- Automatic formatting

---

## 🌙 Focus Mode

Distraction-free interface mode for:
- Deep work
- Focus sessions
- Productivity sprints

---

# 💾 Local Storage Architecture

The application persists all important data locally:

| Feature | Persistence |
|---|---|
| Theme | ✅ |
| Bookmarks | ✅ |
| Tasks | ✅ |
| Daily Goal | ✅ |
| Quote Cache | ✅ |
| Visit Analytics | ✅ |

---

# 🧱 Tech Stack

## Frontend
- HTML5
- CSS3
- Vanilla JavaScript (ES6 Modules)

## Browser APIs
- localStorage API
- Fetch API
- Intl DateTimeFormat API

---

# 📂 Project Structure

```text
bookbyte/
│
├── index.html
│
│── logo.jpg
│
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── themes.css
│
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── theme.js
│   ├── bookmarks.js
│   ├── tasks.js
│   ├── quotes.js
│   ├── pomodoro.js
│   ├── converter.js
│   └── clocks.js
│
└── README.md