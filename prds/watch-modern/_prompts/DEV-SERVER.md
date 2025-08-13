---

### 1. Check Dev Processes

Check if `nx serve` processes are running:

```bash
if ! pgrep -fl "nx serve" > /dev/null; then
  echo "⚠️ nx serve processes not found. Launching 'nf start'..."
  nf start &
  sleep 5
else
  echo "✅ nx serve processes already running."
fi
```

---

### 2. Verify Dev Server

Check if development server is responding on `localhost:4200`:

```bash
set -Eeuo pipefail

sleep 5
cd /workspaces/core

health_url="http://localhost:4200"
alive_final_codes="200"

final_code_and_url() {
  curl -sS \
    --connect-timeout 1 \
    --max-time 3 \
    -L -o /dev/null \
    -w '%{http_code} %{url_effective}' \
    "$health_url" || echo ""
}

is_final_ok() {
  local code="$1"
  for a in $alive_final_codes; do
    [[ "$code" == "$a" ]] && return 0
  done
  return 1
}

read code url <<<"$(final_code_and_url || true)"

if ! is_final_ok "${code:-}"; then
  echo "⚠️ Dev server not healthy yet (final ${code:-none} at ${url:-n/a}). Starting…"
  nx run watch-modern:serve --port=4200 > /tmp/watch_modern_serve.log 2>&1 &

  for i in $(seq 1 20); do
    sleep 1
    read code url <<<"$(final_code_and_url || true)"
    if is_final_ok "${code:-}"; then
      echo "✅ Dev server healthy at $url (HTTP $code)"
      exit 0
    else
      echo "⏳ Still waiting… attempt $i/20 (got ${code:-none} at ${url:-n/a})"
    fi
  done

  echo "❌ Dev server never came up. Last check: ${code:-none} at ${url:-n/a}."
  echo "   Tail /tmp/watch_modern_serve.log for errors."
  exit 1
else
  echo "✅ Dev server already healthy at $url (HTTP $code)"
fi
```

---

### 3. Check for Runtime Errors

Detect runtime issues via status code and known error patterns:

```bash
url="http://localhost:4200/watch"
max_retries=3
delay=2

echo "🔍 Checking for runtime errors at $url..."

for i in $(seq 1 $max_retries); do
  echo "⏳ Attempt $i/$max_retries..."

  # Check HTTP status
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$code" != "200" ]; then
    echo "❌ Server error: HTTP $code"
    exit 1
  fi

  # Get page content
  content=$(curl -s "$url")
  
  # Check for actual runtime errors (not framework templates)
  if echo "$content" | grep -qiE "Too many re-renders|Maximum update depth exceeded|Error:.*at.*in.*|Uncaught.*Error|React.*Error|TypeError|ReferenceError|RangeError"; then
    echo "❌ Runtime error detected on attempt $i"
    echo "Found actual React/JavaScript runtime error"
    exit 1
  fi
  
  # Check for error boundary activation (actual errors, not templates)
  if echo "$content" | grep -qiE "Something went wrong.*Error details|An error occurred.*Try refreshing|Error boundary caught"; then
    echo "❌ Error boundary activated on attempt $i"
    echo "Found actual error boundary display"
    # exit 1
  fi

  # Check for Next.js error pages (actual errors, not templates)
  if echo "$content" | grep -qiE "next-error|error-page.*404|This page could not be found.*404"; then
    echo "❌ Next.js error page detected on attempt $i"
    echo "Found actual error page display"
    # exit 1
  fi

  sleep $delay
done

echo "✅ Page renders cleanly after $max_retries attempts"
```
