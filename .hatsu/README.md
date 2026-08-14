# .hatsu — Hatsu pipeline descriptor

[Hatsu](https://github.com/JesusFilm/hatsu) is the autonomous bug-fixing
pipeline (intake → build → QA) that processes issues in this repo. This folder
is how core **self-describes** to the pipeline, so the engine stays generic and
all repo-specific data lives here, versioned alongside the code it describes
(ENG-3699 / ENG-3733).

- `target.json` — the target descriptor: repo identity, default branch, and
  the gate commands agents run inside a ticket worktree. The pipeline's
  `hatsu.config.ts` currently carries an operational copy of these values;
  teaching the engine to read this file at runtime (and which side wins) is
  tracked on Cade's MVP ticket.
- `Dockerfile` — **stub, not yet built or used.** Per-ticket isolation today
  is a git worktree on the pipeline VM, not a container (ENG-3699 decision).
  This file reserves the seam for the one place that may later need real
  containers: parallel QA runs booting the app stack (ENG-3719).

Changing gate commands here is safe and encouraged when the toolchain
changes; the pipeline picks them up without an engine release once the
runtime merge lands.
