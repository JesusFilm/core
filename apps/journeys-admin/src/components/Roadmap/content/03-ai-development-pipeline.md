---
title: AI-assisted development pipeline
order: 3
category: ai
size: large
status: In progress
effort: Large
---

A workflow where AI helps move work forward — gathering context on an issue,
proposing a plan, drafting the change, and running it through review and testing
before a human signs off.

---

Three AI agents, each with one job, handing work along a chain. The goal is
that small, well-described problems get fixed without anyone having to stop
what they're doing — a bug reported overnight can be waiting as a reviewed
change in the morning.

### 1. Intake

Talks to the reporter in Slack, replacing the current bug and feature bots.
Rather than a form, it asks the questions an engineer would ask anyway — what
you were doing, what you expected, what happened instead — and turns the
answers into a ticket that's actually workable.

### 2. Work

Picks up the ticket, investigates the codebase, makes the change, and opens a
pull request.

### 3. Test

Exercises the change the way a person would before it reaches human review, so
what lands in front of a reviewer has already been tried.

### Where work comes from

- Bug reports raised by people in Slack
- Warnings and errors surfaced by our monitoring
- Tickets pushed into the queue by hand

### Why it comes before the feature work

Small issues arriving at unpredictable times are what break up the working
week. Handling them automatically is what makes a sustained run at larger
features possible — and the backlog is what tunes the pipeline, since each real
ticket it works through shows where it needs sharpening.

A human still reviews and approves every change. Nothing reaches production
without someone signing it off.
