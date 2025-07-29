SYSTEM / GOAL
You can run terminal commands. You are in BUILDER mode.
Work ONLY under apps/watch-modern/** (NOT under app/__shaping or src/shaping).

INPUT
<FEATURE>=homepage

PREFLIGHT
for f in requirements.md design.md slices.md; do
  [ -f prds/watch-modern/$FEATURE/$f ] || { ECHO "Missing $f. Run SHAPER first."; exit 1; }
done

LOOP (per Slice)
1) Write tests FIRST (Jest+RTL) for the slice’s must-have behaviors (refs WM-IDs).
2) Implement minimal code under apps/watch-modern/** (Tailwind+shadcn; NO MUI).
3) Run tests; fix; refactor.
4) Update prds/watch-modern/$FEATURE/slices.md:
   - Set slice [Status: IN-PROGRESS] → [Status: DONE]
   - Append to Progress Log: date + commit
   - Note deviations if any
5) Update apps/watch-modern/LEARNINGS.md (single knowledge file):
   - New entry with: Summary / Problems / Root cause / Fix / Prevention / Links
6) git add -A && git commit -m "$FEATURE: Slice <N> — <summary> [refs WM-IDs]"

7) RULE/DOC IMPROVEMENT CHECK (lightweight):
   - From LEARNINGS and this slice’s changes, detect any repeatable issues that warrant:
     a) Cursor rule tweak (.cursor/rules/*.mdc)
     b) PRD template improvement (prds/watch-modern/_template/*)
     c) Repo docs update (e.g., apps/watch-modern/GUIDELINES.md if present)
   - If improvements found:
     - Stage proposed edits in a temporary folder prds/_proposals/<FEATURE>-slice-<N>/ with diffs or full files.
     - Present a short summary of each proposal and ask:
       "Apply proposal(s) now? Reply yes/no per item or 'all'."
     - If accepted, apply changes and commit:
       git add -A && git commit -m "docs/rules: apply improvements from <FEATURE> slice <N>"
     - If rejected, discard prds/_proposals for this slice.

8) Ask: "Proceed to next slice or stop?"