# 🛠️  Quick-Start — AI DEV MODE Feature Flow

> **Goal:** ship a new Watch-Modern feature with pixel-perfect design and full backend wiring, guided by Cursor background agents.

---

## 1. Drop the mockup  
```bash
cp -R <exported-mockup> prds/watch-modern/<feature>/intake/ui/
```

## 2. Run agents in order with the next prompts

### 1: 
`Start the dev process per the FRONTEND prompt desciribed in @1-FRONTEND.md`
---

## 3. Progress & docs

- **Spec & status:** `prds/watch-modern/<feature>/spec/` (`slices.md` shows progress).  
- **Knowledge log:** `apps/watch-modern/LEARNINGS.md` (auto‑updated each slice).

---

### TL;DR

1. **Drop mockup → run FRONTEND agent → approve.**  
2. **Run SHAPING agent** until all unknowns defined.  
2. **Run BUILDER** until all implemented.
3. **Run CLEANUP** (optional) then **RETRO**.  
4. Merge.

All prompts live in **`/_prompts`** – open the next one and hit **Run**. Happy shipping!
