# ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
# ┃   WATCH-MODERN · SPEC-FIRST + SHAPE UP · CURSOR AGENTS       ┃
# ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

                    ╭────────────────────────╮
                    │        INTAKE          │
                    │   (guided interview)   │
                    ╰────────────┬───────────╯
                                 │
                                 ▼
                    ╭────────────────────────╮
                    │         VIBE           │
                    │   (shaping UI only)    │
                    ╰────────────┬───────────╯
                                 │
                           Freeze artifacts
                                 │
                                 ▼
                    ╭────────────────────────╮
                    │        SHAPER          │
                    │ (pitch/spec from vibe) │
                    ╰────────────┬───────────╯
                                 │
                                 ▼
                    ╭────────────────────────╮
                    │        BUILDER         │
                    │   (vertical slices)    │
                    ╰────────────┬───────────╯
                                 │
                             Learnings
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
      ╭──────────────────────╮        ╭──────────────────────╮
      │   ARCHIVE SHAPING    │        │  RETRO & RULE TUNING │
      │ (stash shaping code) │        │ (improve docs/rules) │
      ╰──────────────────────╯        ╰──────────────────────╯

## Files / Modes
- **01-INTAKE.md** — Interview user; writes `prds/watch-modern/<feature>/intake.md`.
- **02-VIBE-FREEZE.md** — Vibecoding in `__shaping/` + `src/shaping/`; user screenshots; freezes artifacts.
- **03-SHAPER.md** — Reads intake+shaping; writes `pitch.md`, `requirements.md`, `design.md`, `slices.md`.
- **04-BUILDER.md** — Slice loop (tests→code→run→update `slices.md` & `LEARNINGS.md`); proposes rule/doc tweaks each slice.
- **05-ARCHIVE-SHAPING.md** — Archives shaping code; proposes shaping rule/template tweaks.
- **06-RETRO-RULE-TUNING.md** — Reviews **LEARNINGS.md**; proposes improvements to `.cursor/rules/*` and PRD templates.

## Where stuff lives
- **Shaping code**: `apps/watch-modern/app/__shaping/<feature>/…`, `apps/watch-modern/src/shaping/<feature>/…`
- **PRDs**: `prds/watch-modern/<feature>/` (intake, pitch, requirements, design, slices, shaping/*)
- **Progress**: `prds/watch-modern/<feature>/slices.md` (Status + Progress Log)
- **Knowledge base**: `apps/watch-modern/LEARNINGS.md` (learnings + troubleshooting)

## Required gates (handled in prompts/rules)
- **INTAKE required** before VIBE/SHAPER/BUILDER.
- **VIBE scope** limited to shaping paths; no tests required.
- **BUILDER** must read PRDs first; TDD; **no MUI**; update `slices.md` + `LEARNINGS.md` each slice.

## How to use
1. Run `01-INTAKE.md` → approve → commit.
2. Run `02-VIBE-FREEZE.md` → take screenshots → freeze → proceed/iterate.
3. Run `03-SHAPER.md` → approve spec → commit.
4. Run `04-BUILDER.md` per slice → accept/reject proposed doc/rule tweaks → commit.
5. (Optional) Run `05-ARCHIVE-SHAPING.md`.
6. Run `06-RETRO-RULE-TUNING.md` to fold **LEARNINGS** back into rules/templates.

## Models
- INTAKE, SHAPER: `claude-4-sonnet`
- VIBE: `gpt-4o`
- BUILDER: `gpt-4.1` (use `o3` for hard refactors; `cursor-small` for codemods)