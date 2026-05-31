# iPhone reminders for Diet (Shortcuts)

Diet on your Home Screen **cannot** send lock-screen alerts or detect Grab by itself. Use the built-in **Shortcuts** app instead.

Add Diet to your Home Screen first (Safari → Share → **Add to Home Screen**). In Shortcuts, use **Open App** → choose **Diet**.

---

## Before you start

1. Open **Shortcuts** on iPhone.
2. Tap **Automation** (bottom).
3. Tap **+** → **New Automation**.
4. Turn **off** “Ask Before Running” when you want alerts without an extra tap (after the first “Always Allow”).

---

## 1. Lunch — 11:30

**Trigger:** Time of Day → **11:30** → Daily (or weekdays only).

**Actions:**

1. **Show Notification**
   - Title: `Lunch soon`
   - Body: `Log after you eat in Diet.`
2. *(Optional)* **Open App** → **Diet** — only if you want the app to open by itself; otherwise open Diet when you’re done eating.

---

## 2. Dinner — 6:00 PM

**Trigger:** Time of Day → **18:00** (6:00 PM) → Daily.

**Actions:**

1. **Show Notification**
   - Title: `Dinner soon`
   - Body: `Log before you eat in Diet.`
2. *(Optional)* **Open App** → **Diet** — open when you want to log before eating; skip if mom is cooking later and you’ll log after.

---

## 3. Grab — “Is it food?”

Shortcuts **cannot** tell food vs a ride. It only knows Grab opened.

**Trigger:** App → **Grab** → **Is Opened**.

**Actions:**

1. **Choose from Menu**
   - Prompt: `Is this for food?`
   - Items: `Yes`, `No`
2. **If** `Chosen Item` **is** `Yes`
   - **Show Notification** — `Log your meal in Diet.`
   - **Open App** → **Diet**
3. **Otherwise** — do nothing (or **Stop This Shortcut**)

Turn **off** “Ask Before Running” for this automation after testing.

**Tip:** Repeat for other food apps you use (e.g. Foodpanda) if you want.

---

## Open Diet from a shortcut

If **Open App** does not list Diet:

1. Use **Open URL** with the same address you used in Safari (from `scripts/start.sh` on your Mac), **or**
2. Re-add Diet to Home Screen and try **Open App** again.

---

## What Diet does in the app

- **Food** tab: log meals, water, history.
- **Summary**: today’s status.
- No in-app reminder section — phone reminders live in Shortcuts only.
