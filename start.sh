#!/bin/bash
# ChromaDB Viewer - Startup Script
# Starts Vite dev server + Query Proxy

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "🔍 ChromaDB Viewer - Starting..."

# Kill existing processes
for port in 3200 3201; do
  pid=$(/usr/sbin/lsof -ti:$port 2>/dev/null)
  [ -n "$pid" ] && kill -9 $pid 2>/dev/null && echo "  Killed old process on port $port"
done

sleep 1

# Start Vite
nohup npx vite --port 3200 > /tmp/chromadb-viewer.log 2>&1 &
echo "  ✅ Vite dev server starting (PID: $!) → http://localhost:3200"

# Start Query Proxy
nohup "$DIR/venv/bin/python" "$DIR/query-proxy.py" > /tmp/chromadb-proxy.log 2>&1 &
echo "  ✅ Query Proxy starting (PID: $!) → http://localhost:3201"

# Wait and verify
sleep 3
HTTP_VITE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3200)
HTTP_PROXY=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3201)

if [ "$HTTP_VITE" = "200" ]; then
  echo "  🟢 Vite: OK"
else
  echo "  🔴 Vite: FAILED (HTTP $HTTP_VITE) — check /tmp/chromadb-viewer.log"
fi

if [ "$HTTP_PROXY" != "000" ]; then
  echo "  🟢 Proxy: OK"
else
  echo "  🔴 Proxy: FAILED — check /tmp/chromadb-proxy.log"
fi

echo "Done."
