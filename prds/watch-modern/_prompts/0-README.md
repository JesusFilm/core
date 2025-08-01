# 🛠️  Quick-Start — AI DEV MODE Feature Flow

> **Goal:** ship a new Watch-Modern feature with pixel-perfect design and full backend wiring, guided by Cursor background agents.

---

## 1. Drop the mockup  
```bash
cp -R <exported-mockup> prds/watch-modern/<feature>/intake/ui/
```

## 2. Run agents in order

| Agent (prompt file) | What it does | Your actions |
|---------------------|--------------|--------------|
| **SHAPING** (`prompts/01-SHAPING-agent.md`) | Reads the mockup, interviews you, writes spec (`prds/.../spec/`). | Answer questions → **approve spec**. |
| **BUILDER** (`prompts/02-BUILDER-agent.md`) | Implements feature **slice-by-slice**: copies markup, adds GraphQL, tests, logs learnings. | Review commits, accept/reject rule/doc tweaks, tell agent to continue/stop. |
| **CLEANUP** (`prompts/03-CLEANUP-agent.md`) | Archives the intake folder after first prod slice ships; suggests shaping-rule tweaks. | Accept/reject tweaks. |
| **RETRO** (`prompts/04-RETRO-agent.md`) | Scans `LEARNINGS.md`, proposes global rule/template improvements. | Accept/reject proposals. |

> **Design lock:** Builder must preserve every Tailwind class; snapshot tests fail if UI drifts.

---

## 3. Progress & docs

- **Spec & status:** `prds/watch-modern/<feature>/spec/` (`slices.md` shows progress).  
- **Knowledge log:** `apps/watch-modern/LEARNINGS.md` (auto‑updated each slice).

---

### TL;DR

1. **Drop mockup → run SHAPING → approve.**  
2. **Run BUILDER** until must‑haves done.  
3. **Run CLEANUP** (optional) then **RETRO**.  
4. Merge.

All prompts live in **`/prompts`** – open the next one and hit **Run**. Happy shipping!
