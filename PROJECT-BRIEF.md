# Diet Tracker — project brief (for a new Cursor chat)

Copy this file into a **new chat**, or say: *"Read Diet-Tracker/PROJECT-BRIEF.md and build the diet tracker."*

---

## Goal

iPhone-first diet tracker for daily use when you're **out of the house**. Not calorie perfection — **awareness and consistency** when willpower is low.

---

## Your constraints (important)

- **Mom cooks dinner** — you cannot change what she makes
- **Lunch** — often Subway (need quick presets)
- You **forget to log** easily
- Hard to **limit portions** at home
- **iPhone only** for now (iPad later maybe)
- **Not** a laptop tool — mobile when you're out

---

## Features to build

### Lunch (quick log)
- Subway presets, e.g.:
  - 6" turkey, no cheese
  - (add more as you use them)
- One-tap log when eating out

### Dinner (mom's kitchen)
- Saved list of dishes mom commonly makes (e.g. "stir-fry + rice")
- Tap dish + rough portion (small / normal / large) — no weighing every grain
- You add dishes over time

### Reminders
- "Log lunch" before ~2pm
- "Log dinner" after eating
- Should feel helpful, not nagging

### Progress view
- **Weekly**, not daily guilt — e.g. "logged 5/7 days"
- Avoid making it feel like a chore

### Not needed (for v1)
- Perfect calorie math
- Weighing food
- Controlling what mom cooks

---

## Tech preferences

- **Full small app** — something you open daily on iPhone
- Could start as: **iPhone web app** (add to Home Screen) or simple PWA
- Lives in: `~/Documents/Cursor/Diet-Tracker/`
- **Do not** create `Diet-Tracker/README.md` — update root `~/Documents/Cursor/README.md` only (see `.cursor/rules/readme-central.mdc`)

---

## Folder layout (match other Cursor tools)

```
Diet-Tracker/
  index.html          ← open on iPhone / Add to Home Screen
  files/ or assets/   ← css, js, data
```

Top level: only what you tap/open. Code in subfolders.

---

## Context from earlier planning

Part of a 3-tool roadmap:
1. ~~Download Organizer~~ — done
2. **Diet Tracker** ← this project
3. Subtitle pipeline (Final Cut Pro) — later, when editing workflow is ready

---

## How to start the new chat

1. **File → Open Folder** → `~/Documents/Cursor` (or `Diet-Tracker` once it exists)
2. **New chat** (fresh conversation)
3. Say something like:

> Build the Diet Tracker from `Diet-Tracker/PROJECT-BRIEF.md`. Start with a simple iPhone web app I can Add to Home Screen.

---

## Open questions for the new chat (decide together)

- PWA vs native wrapper later?
- Store logs on device only (localStorage) vs sync?
- Chinese / English UI?
- Initial list of mom's dishes — start empty or seed a few?
