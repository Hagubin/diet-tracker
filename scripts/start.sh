#!/bin/bash
# Serve Diet-Tracker on your LAN so iPhone Safari can open it and Add to Home Screen.
cd "$(dirname "$0")/.." || exit 1
PORT="${PORT:-8765}"
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
echo "Diet Tracker: http://${IP}:${PORT}/index.html"
echo "On iPhone (same Wi‑Fi): open that URL in Safari → Share → Add to Home Screen"
echo "Press Ctrl+C to stop."
exec python3 -m http.server "$PORT" --bind 0.0.0.0
