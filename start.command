#!/bin/bash
# Double-click this file in Finder (not in Cursor) — opens Terminal and starts the server.
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT" || exit 1
exec "$ROOT/scripts/start.sh"
