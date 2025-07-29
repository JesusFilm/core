SYSTEM / GOAL
You can run terminal commands. You are in VIBE (shaping) mode.

INPUT
<FEATURE>=homepage

PREFLIGHT
[ -f prds/watch-modern/$FEATURE/intake.md ] || { ECHO "Missing intake.md. Run INTAKE first."; exit 1; }

PLAN
1) Append a "Vibe Plan" to prds/watch-modern/$FEATURE/shaping/notes.md (derived from intake).
2) Scaffold shaping under app/__shaping/$FEATURE and src/shaping/$FEATURE only.
3) Start dev and PAUSE; user saves screenshots to prds/watch-modern/$FEATURE/shaping/screens/.
4) Generate/update artifact-map.md + notes.md (branch/commit).
5) Ask: proceed to SHAPER or iterate VIBE?

ACTIONS
# 1) Vibe Plan
mkdir -p prds/watch-modern/$FEATURE/shaping/screens
touch prds/watch-modern/$FEATURE/shaping/notes.md
echo "\n## Vibe Plan (derived from intake)" >> prds/watch-modern/$FEATURE/shaping/notes.md
echo "- Planned screens: ..." >> prds/watch-modern/$FEATURE/shaping/notes.md
echo "- Sample hardcoded data shape: ..." >> prds/watch-modern/$FEATURE/shaping/notes.md
echo "- Risks/unknowns to flag: ..." >> prds/watch-modern/$FEATURE/shaping/notes.md

# 2) Scaffold minimal shaping page (only shaping paths)
mkdir -p apps/watch-modern/app/__shaping/$FEATURE
mkdir -p apps/watch-modern/src/shaping/$FEATURE
if [ ! -f apps/watch-modern/app/__shaping/$FEATURE/page.tsx ]; then
cat > apps/watch-modern/app/__shaping/$FEATURE/page.tsx <<'TSX'
export default function ShapingPage() {
  const featured = [{ id: 1, title: 'Featured 1' }, { id: 2, title: 'Featured 2' }];
  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Watch Modern — <FEATURE> (Shaping)</h1>
        <button className="px-3 py-1 border rounded">Language</button>
      </header>
      <section>
        <h2 className="text-xl font-semibold mb-2">Featured</h2>
        <div className="grid grid-cols-2 gap-4">
          {featured.map(x => <div key={x.id} className="border rounded p-4">{x.title}</div>)}
        </div>
      </section>
      <footer className="text-sm opacity-60">Hardcoded data. No backend. Shaping route.</footer>
    </main>
  );
}
TSX
fi

git add -A && git commit -m "shaping($FEATURE): scaffold __shaping route"

# 3) Start dev and pause for screenshots
pnpm dev &
ECHO >>> Open http://localhost:3000/__shaping/$FEATURE
ECHO >>> Take 1–3 screenshots and SAVE THEM to prds/watch-modern/$FEATURE/shaping/screens/
ECHO >>> Reply "screens saved" when done.

# 4) Freeze artifacts (no puppeteer)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
SHA=$(git rev-parse --short HEAD)
AMAP=prds/watch-modern/$FEATURE/shaping/artifact-map.md
{
  echo "# Shaping Artifacts"
  echo "- Files:"; find apps/watch-modern/app/__shaping/$FEATURE apps/watch-modern/src/shaping/$FEATURE -type f | sort | sed 's/^/  - /'
  echo "- Screenshots:"; ls -1 prds/watch-modern/$FEATURE/shaping/screens 2>/dev/null | sed "s|^|  - prds/watch-modern/$FEATURE/shaping/screens/|"
  echo "- Commit: $SHA"
} > "$AMAP"
if ! grep -q "Branch/commit" prds/watch-modern/$FEATURE/shaping/notes.md 2>/dev/null; then
  echo "\n## Branch/commit\n- branch: $BRANCH  commit: $SHA" >> prds/watch-modern/$FEATURE/shaping/notes.md
fi
git add -A && git commit -m "shaping($FEATURE): freeze artifacts (notes, artifact-map, screenshots refs)"

# 5) Ask next step
ECHO >>> Shaping artifacts frozen. Proceed to SHAPER (spec) or iterate VIBE?