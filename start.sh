#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "=== Starting SNOW Voting System ==="

# 1. Start backend
echo "[backend] Starting Express API on http://localhost:3001"
node "$ROOT_DIR/backend/index.js" &
BACKEND_PID=$!

# 2. Start frontend
echo "[frontend] Starting Astro dev server"
cd "$ROOT_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:4321"
echo "  Press Ctrl+C to stop both."
echo ""

wait
