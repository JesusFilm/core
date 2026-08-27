---
title: Create new features
order: 6
category: feature
size: large
status: Later
subRow: 1
spanToEnd: true
---

Adding new capabilities to the editor.

1. Journeys editing via MCP — XL
2. AI feedback on journey best-practices — L
3. Offline mode for journeys and the editor — XL
4. New viewer role — M
5. Moving journeys between teams — M

---

Effort levels are rough sizes, not estimates: **S**mall, **M**edium, **L**arge,
and **XL** for work that goes significantly beyond Large.

### 1. Journeys editing via MCP — Extra Large

Letting an AI assistant build or change a journey on someone's behalf. The
database behind a journey is complex enough that the hard part isn't connecting
an AI to it — it's teaching the AI to produce a journey that's actually correct.

> **Who is this for? If we built it, who would actually use it — and is that a
> big enough audience to justify a lot of work?**

### 2. AI feedback on journey best-practices — Large

Rather than telling someone what they've done wrong, this would offer tips
drawn from what successful journeys have in common — which keeps the advice
grounded in analytics instead of opinion.

> **If we built this, where in the product would it be helpful — somewhere
> people would actually see it and use it?**

### 3. Offline mode for journeys and the editor — Extra Large

A large amount of unknowns here. We haven't scoped what "offline" means in
practice, and the answer changes the size of this dramatically. The Extra Large
signals that we don't yet know how big it is, rather than a measured estimate.

> **When does this become important enough for us to dig into it?**

### 4. New viewer role — Medium

View-only access, at both journey and team level, so people can see a team's
journeys and stats without being able to change anything. View only — no
commenting.

> **What should a viewer be able to see? Our assumption is everything,
> analytics included — is there anything we'd want to keep from them?**

### 5. Moving journeys between teams — Medium

If visitor data stays with the original team, this is a set of straightforward
updates. If it has to move with the journey, it becomes a data migration —
visitor records are held per person per team rather than per journey, so they'd
need splitting rather than reassigning.

> **Is it OK to move visitor data between teams?**
>
> This needs a data-privacy answer rather than a product one — particularly
> EU/GDPR.
