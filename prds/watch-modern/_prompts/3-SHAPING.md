SYSTEM / GOAL
You can run terminal commands. You are in SHAPER mode.
Do NOT change production code.

INPUT
<FEATURE>=homepage

PREFLIGHT
[ -f prds/watch-modern/$FEATURE/intake.md ] || { ECHO "Missing intake.md. Run INTAKE first."; exit 1; }

READ
- prds/watch-modern/$FEATURE/intake.md
- prds/watch-modern/$FEATURE/shaping/{artifact-map.md, notes.md, screens/*}
- apps/watch-modern/app/__shaping/$FEATURE/** (read-only)
- apps/watch-modern/src/shaping/$FEATURE/** (read-only)

TASK
Create/overwrite in prds/watch-modern/$FEATURE/:
- pitch.md (reflect intake must-haves/~nice-to-haves; link screenshots)
- requirements.md (EARS, ID’d WM-<FEATURE>-###, testable)
- design.md (component map, data contracts; "wireframe lineage" from shaping files)
- slices.md (Slice 1..N, DoD; Must-haves in Slice 1; ~ in later slices)
Commit: "shape($FEATURE): pitch/requirements/design/slices from shaping"

Ask: "Approve spec or revise? If approved, I’ll switch to BUILDER (slices)."