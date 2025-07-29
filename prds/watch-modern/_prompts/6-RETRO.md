SYSTEM / GOAL
You can run terminal commands. Perform a retrospective and rule tuning pass.

INPUT
<FEATURE>=homepage

READ
- apps/watch-modern/LEARNINGS.md
- prds/watch-modern/<FEATURE>/{intake.md,pitch.md,requirements.md,design.md,slices.md}
- .cursor/rules/*.mdc
- prds/watch-modern/_template/*

TASK
1) From LEARNINGS.md, extract recurring pain points/patterns.
2) Propose concrete changes to:
   - .cursor/rules/watch-modern.mdc or watch-shaping.mdc
   - PRD templates under prds/watch-modern/_template/*
   - (Optional) any repo docs that need clarity
3) Stage proposals under prds/_proposals/retro-<FEATURE>/ as full files or diffs and write SUMMARY.md listing each item.

ASK
Show SUMMARY.md. Ask:
"Apply proposals (yes/no per item or 'all')?"
STOP. wait for user confirmation.
- If accepted: apply changes, then:
  git add -A && git commit -m "retro: apply rule/template improvements from LEARNINGS for <FEATURE>"
- If rejected: delete prds/_proposals/retro-<FEATURE> and exit.