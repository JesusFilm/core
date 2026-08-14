# Intake map — structure contract (v1)

The fixed structure that map consumers — the ENG-3707 accessor, its validator, and any future
harness (intake, build, QA) — are written against. Audience: **map authors** (humans and agents
editing the intake layer) and **consumer code**. This file is the contract; `CONTEXT-MAP-intake.md`
is the data. This file is _not_ always-in-context — only the INDEX is.

Versioning: additive edits to the map need no contract change. A breaking change (see
§Compatibility) bumps the version in this title and must land only after consumers are updated.

## Files & discovery

- The INDEX is `CONTEXT-MAP-intake.md` at the repo root. It is the **only** entry point.
- Each area's intake file lives at `<area-dir>/CONTEXT-intake.md` and is reached **only** via the
  index entry's `intake:` path. Consumers must not glob for `CONTEXT-intake.md` files — an intake
  file not listed in the index is not part of the map.
- All paths in the index are repo-relative.

## INDEX format (`CONTEXT-MAP-intake.md`)

- Area entries are single-line bullets under the level-2 heading beginning `Areas` (today
  `## Areas (NextSteps)` — heading suffixes are free, the prefix is the anchor):

  ```text
  - **<area name>** (<role>) | domain: `<path>` | intake: `<path>` | triggers: "<phrase>", "<phrase>", …
  ```

- Parsers key on the literal field tokens `| domain:`, `| intake:`, `| triggers:` — but only
  inside bullet entries under the `Areas` heading. Lines anywhere else are never entries, even
  when they contain the tokens (the index's own `**Line format:**` prose does). Never reorder,
  rename, or wrap an entry across lines. `<area name>` is the entry's identity and must equal the
  `area` frontmatter key of the file `intake:` points to.
- The taxonomy list under the level-2 heading beginning `Failure-type taxonomy` (today
  `## Failure-type taxonomy (T1–T11)`) has bullets beginning `- **T<n>**` followed by the type's
  name; an em-dash note may follow (used today for retirement / not-live status, e.g. T9).
- Anything else in the INDEX (prose, extra headings) is free-form; consumers ignore it.

## Intake-file frontmatter

YAML frontmatter delimited by `---` lines, starting at byte 0 of the file. Required keys:

| key               | shape                        | meaning                                                                                                |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `area`            | string                       | identity; must equal the index entry's `<area name>`                                                   |
| `domain_ref`      | relative path                | the sibling domain `CONTEXT.md`                                                                        |
| `code_paths`      | block list of glob strings   | where this area's code lives; each glob's fixed (pre-wildcard) directory prefix must exist in the repo |
| `trigger_phrases` | block list of quoted strings | **authoritative** reporter vocabulary for this area                                                    |
| `type_tags`       | inline list, e.g. `[T1, T4]` | the failure types this file covers                                                                     |
| `updated`         | `YYYY-MM-DD`                 | date of last substantive edit                                                                          |

Authors may add further keys freely (additive); consumers must ignore unknown keys.

## Section anatomy

- A **section** is one level-2 `##` heading plus its body (up to the next level-2 heading or end
  of file).
- A typed section carries its T-tags in the heading text (any `T<n>` token counts, e.g.
  `— T4 (cache) · T5 (optimistic drift)`, `— T6, expectation mismatch`). Sections with no T-token
  are untyped (how-to / FAQ / flagged entries) — allowed.
- `type_tags` in frontmatter equals the union of T-tags found in the file's headings.
- Bodies are built from bold-label lines (`**Signatures:**`, `**Localizing question (reporter):**`,
  `**Then ask:**`, `**Ready when:**`, `**Status:**`, `**Look first (fixer):**`, `**Handoff:**`, …).
  A label line matches after stripping leading indentation and an optional `- ` list marker — the
  flush-left, indented (list-item continuation), and list-bullet (`- **Handoff:** …`) forms all
  occur on `main` today. The bold may extend past the label over the whole line, label and value
  together (e.g. `**Localizing question (reporter): does a refresh fix it?**`).
  The label vocabulary is **open** — authors may introduce new labels; consumers must not assume a
  fixed set or order — with one exception:
- **`Handoff:` is reserved.** Every section closes its diagnosis with a `**Handoff:**` verdict
  (agent-able / human / how-to-FAQ / ops), the one label consumers may key on semantically.
  - _Known deviation on `main` today: `apps/journeys/CONTEXT-intake.md` § "Chat / AI assistant"
    embeds its verdict in `**Status:**` with no `**Handoff:**` line — left as-is deliberately
    (unreleased feature, plan not settled; Siyang, 2026-08-13). The validator reports it as a
    warning until the section gets a real diagnosis layer._

## Index ↔ frontmatter sync

- `trigger_phrases` in frontmatter is authoritative. The index entry's `triggers:` list carries
  the same phrases for routing, each **verbatim or shortened**: every index phrase must be a
  substring of one of that area's `trigger_phrases` (today every index phrase is verbatim;
  shortening remains allowed). When an area gains a trigger phrase, add it to **both**
  `trigger_phrases` and the index `triggers:` list in the same commit.
- The index entry's `domain:` path and the frontmatter `domain_ref` (resolved against the intake
  file's directory) must resolve to the same file.

## Compatibility

**Safe — add freely, no consumer changes needed:**

- new sections (a typed section's T-tags must join `type_tags` in the same commit — §Section
  anatomy); new bold labels inside section bodies; new prose anywhere in a body
- new trigger phrases (added to both frontmatter and index)
- new frontmatter keys; new areas (a new index bullet in the entry format + a conforming file)
- em-dash notes on taxonomy bullets; heading suffix text alongside T-tags

**Breaking — update the accessor + validator first, bump the contract version:**

- renaming/removing any required frontmatter key, or emitting non-YAML frontmatter
- changing or reordering the index field tokens (`| domain:`, `| intake:`, `| triggers:`), or
  splitting an area entry across lines
- changing the `Areas` / `Failure-type taxonomy` heading prefixes (suffix text is free), or
  moving/renaming `CONTEXT-MAP-intake.md` or an intake file without updating the index in the
  same commit
- repurposing the `Handoff:` label
