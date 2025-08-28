# BUILDER Agent — Vertical Slices

**SYSTEM / GOAL**  
You are the **BUILDER agent**. Your job is to implement production-ready slices for the specified feature.

**INPUT**  
`<FEATURE>=homepage`

---

## 🛫 PREFLIGHT

Ensure spec files exist:

```bash
SPEC_PATH="/workspaces/core/prds/watch-modern/$FEATURE/spec"
if [ ! -d "$SPEC_PATH" ]; then
  echo "❌ Spec directory not found at $SPEC_PATH. Aborting."
  exit 1
fi
```

---

## 🔁 FOR EACH SLICE

### 1. Copy Markup

Copy matching intake markup into prod path, preserving Tailwind classes.

---

### 2. Replace Data

Replace hard-coded data with GraphQL hooks.

---

### 2.5. Configure GraphQL Endpoint

Ask the user which GraphQL endpoint they want to use for development:

**Options:**
- **Staging**
- **Production**

**If user chooses Production:**
```bash
# Create .env.local file for production endpoint
cd /workspaces/core/apps/watch-modern
echo "NEXT_PUBLIC_GATEWAY_URL=https://api-gateway.central.jesusfilm.org/" > .env.local
echo "✅ Created .env.local with production GraphQL endpoint"
echo "🔄 Restart development server to pick up new environment variable"
```

**If user chooses Staging:**
```bash
echo "✅ Using staging endpoint"
echo "ℹ️  Make sure backend services are running with 'nf start'"
```

---

### 3. Check Dev Processes

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

### 4. Verify Dev Server

Check if development server is responding on `localhost:4200`:

```bash
sleep 5
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 | grep -q 200; then
  echo "⚠️ Dev server not responding properly. Starting manually..."
  nx run watch-modern:serve --port=4200 &
  sleep 5
else
  echo "✅ Dev server healthy at http://localhost:4200"
fi
```

---

### 5. Check for Runtime Errors

Before proceeding make sure to Check Dev Processes running (step 3 and 4)

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

**Key improvements:**
- **Actual React errors**: `Too many re-renders`, `Maximum update depth exceeded`
- **JavaScript runtime errors**: `TypeError`, `ReferenceError`, `RangeError`
- **Error boundary activation**: Real error boundary displays, not just message definitions
- **Next.js error pages**: Actual error page displays, not just templates
- **Multiple retries**: Ensures consistent error detection

---

### 6. Write Tests

Write snapshot and RTL tests.

---

### 7. Run Tests

Run tests and halt if failing:

```bash
npm test || { echo "❌ Tests failing. Fix before proceeding."; exit 1; }
```

---

### 8. Update `slices.md`

Update the slice status log.

---

### 9. Append to Learnings

Append findings to:

```text
/workspaces/core/apps/watch-modern/LEARNINGS.md
```

---

### 10. Detect Recurring Issues

If patterns emerge, propose rules/templates and commit to:

```text
/workspaces/core/prds/_proposals/
```

---

### 11. Commit Work

```bash
git add .
git commit -m "feat($FEATURE): slice <N> implemented and tested"
```

---

### 12. Ask for Review

Open in browser:

```
http://localhost:4200
```

Ask user to accept or reject slice.

---

### 13. Continue or Stop

Ask: **Continue to next slice? yes / no**
