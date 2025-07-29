SYSTEM / GOAL
You can run terminal commands. Archive shaping artifacts for <FEATURE>.
Also check if shaping prompts/rules/docs need improvements; propose, and ask for approval to apply.

INPUT
<FEATURE>=homepage

ACTIONS
FEATURE=<FEATURE>
SHA=$(git rev-parse --short HEAD)
DATE=$(date +"%Y-%m-%d")

# Archive shaping code
mkdir -p apps/watch-modern/src/shaping/_archive/${FEATURE}-${SHA}
if [ -d apps/watch-modern/app/__shaping/$FEATURE ]; then
  mkdir -p apps/watch-modern/src/shaping/_archive/${FEATURE}-${SHA}/__shaping
  git mv apps/watch-modern/app/__shaping/$FEATURE apps/watch-modern/src/shaping/_archive/${FEATURE}-${SHA}/__shaping/ || true
fi
if [ -d apps/watch-modern/src/shaping/$FEATURE ]; then
  git mv apps/watch-modern/src/shaping/$FEATURE apps/watch-modern/src/shaping/_archive/${FEATURE}-${SHA}/ || true
fi

# Mark archived in PRD
mkdir -p prds/watch-modern/$FEATURE/shaping
cat > prds/watch-modern/$FEATURE/shaping/ARCHIVED.md <<EOF
# Shaping Archived
- Feature: $FEATURE
- Archived: $DATE
- Commit: $SHA
- Moved to: apps/watch-modern/src/shaping/_archive/${FEATURE}-${SHA}/
EOF
if [ -f prds/watch-modern/$FEATURE/design.md ]; then
  echo "\n> NOTE: Shaping artifacts archived on $DATE @ $SHA. See ./shaping/ARCHIVED.md." >> prds/watch-modern/$FEATURE/design.md
fi
git add -A && git commit -m "archive($FEATURE): move shaping artifacts to _archive and mark in PRD"

# PROPOSE IMPROVEMENTS for shaping workflow/rules/docs
mkdir -p prds/_proposals/$FEATURE-archive
# Analyze LEARNINGS.md and shaping notes to see if prompts/rules should change (manual reasoning step)
# Draft suggested edits (examples):
# - .cursor/rules/watch-shaping.mdc: clarify bounds or outputs
# - prds/watch-modern/_template/shaping/notes.md: add a “Vibe Plan” block, etc.
# Write a short proposal summary:
cat > prds/_proposals/$FEATURE-archive/SUMMARY.md <<'EOF'
# Proposed improvements (shaping)
1) Rule tweak: clarify shaping should avoid modifying global styles.
2) Template tweak: add "Vibe Plan" required bullets in shaping/notes.md.
EOF

ECHO >>> Proposed improvements are staged in prds/_proposals/$FEATURE-archive. Apply now? (yes/no per item or 'all')
# If accepted, apply changed files and:
# git add -A && git commit -m "rules/docs: apply shaping improvements for $FEATURE"