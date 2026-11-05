# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a **multi-context** repo (an Nx monorepo). Contexts are the individual workspaces under `apps/`, `apis/`, and `libs/`.

## Before exploring, read these

- **`GLOSSARY-MAP.md`** at the repo root — it points at one `GLOSSARY.md` per context (workspace). Read each one relevant to the topic.
- Each relevant workspace's **`GLOSSARY.md`** (e.g. `apps/journeys/GLOSSARY.md`, `apis/api-media/GLOSSARY.md`).
- **`docs/adr/`** at the root for system-wide decisions, plus any workspace-scoped `<workspace>/docs/adr/` for decisions local to that context.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Multi-context repo (presence of `GLOSSARY-MAP.md` at the root):

```
/
├── GLOSSARY-MAP.md                     ← points to each workspace's GLOSSARY.md
├── docs/adr/                          ← system-wide decisions
├── apps/
│   ├── journeys/
│   │   ├── GLOSSARY.md
│   │   └── docs/adr/                  ← context-specific decisions
│   └── journeys-admin/
│       ├── GLOSSARY.md
│       └── docs/adr/
├── apis/
│   └── api-media/
│       ├── GLOSSARY.md
│       └── docs/adr/
└── libs/
    └── shared/.../
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant workspace's `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
