# Intake map — structure contract (v1)

The fixed structure that map consumers — the ENG-3707 accessor, its validator, and any future
harness (intake, build, QA) — are written against. Audience: **map authors** (humans and agents
editing the intake layer) and **consumer code**. This file is the contract; `CONTEXT-MAP-intake.md`
is the data. This file is *not* always-in-context — only the INDEX is.

Versioning: additive edits to the map need no contract change. A breaking change (see
§Compatibility) bumps the version in this title and must land only after consumers are updated.

## Files & discovery

- The INDEX is `CONTEXT-MAP-intake.md` at the repo root. It is the **only** entry point.
- Each area's intake file lives at `<area-dir>/CONTEXT-intake.md` and is reached **only** via the
  index entry's `intake:` path. Consumers must not glob for `CONTEXT-intake.md` files — an intake
  file not listed in the index is not part of the map.
- All paths in the index are repo-relative.

## INDEX format (`CONTEXT-MAP-intake.md`)

- Area entries are single-line bullets under the `## Areas` heading:

  ```
  - **<area name>** (<role>) | domain: `<path>` | intake: `<path>` | triggers: "<phrase>", "<phrase>", …
  ```

- Parsers key on the literal field tokens `| domain:`, `| intake:`, `| triggers:`. Never reorder,
  rename, or wrap an entry across lines. `<area name>` is the entry's identity and must equal the
  `area` frontmatter key of the file `intake:` points to.
- The taxonomy list under the `## Failure-type taxonomy` heading has bullets beginning
  `- **T<n>**` followed by the type's name; an em-dash note may follow (used today for retirement
  / not-live status, e.g. T9).
- Anything else in the INDEX (prose, extra headings) is free-form; consumers ignore it.

## Intake-file frontmatter

YAML frontmatter delimited by `---` lines, starting at byte 0 of the file. Required keys:

| key | shape | meaning |
| --- | --- | --- |
| `area` | string | identity; must equal the index entry's `<area name>` |
| `domain_ref` | relative path | the sibling domain `CONTEXT.md` |
| `code_paths` | block list of glob strings | where this area's code lives; each glob's fixed (pre-wildcard) directory prefix must exist in the repo |
| `trigger_phrases` | block list of quoted strings | **authoritative** reporter vocabulary for this area |
| `type_tags` | inline list, e.g. `[T1, T4]` | the failure types this file covers |
| `updated` | `YYYY-MM-DD` | date of last substantive edit |

Authors may add further keys freely (additive); consumers must ignore unknown keys.

## Section anatomy

- A **section** is one `## ` heading plus its body (up to the next `## ` or end of file).
- A typed section carries its T-tags in the heading text (any `T<n>` token counts, e.g.
  `— T4 (cache) · T5 (optimistic drift)`, `— T6, expectation mismatch`). Sections with no T-token
  are untyped (how-to / FAQ / flagged entries) — allowed.
- `type_tags` in frontmatter equals the union of T-tags found in the file's headings.
- Bodies are built from bold-label lines (`**Signatures:**`, `**Localizing question (reporter):**`,
  `**Then ask:**`, `**Ready when:**`, `**Status:**`, `**Look first (fixer):**`, `**Handoff:**`, …).
  The label vocabulary is **open** — authors may introduce new labels; consumers must not assume a
  fixed set or order — with one exception:
- **`Handoff:` is reserved.** Every section closes its diagnosis with a `**Handoff:**` verdict
  (agent-able / human / how-to-FAQ / ops), the one label consumers may key on semantically.
  - _Known deviations on `main` today (flagged, to be fixed by a map edit, not by loosening the
    contract): `apps/journeys/CONTEXT-intake.md` § "Chat / AI assistant" embeds its verdict in
    `**Status:**` with no `**Handoff:**` line; `apps/journeys-admin/CONTEXT-intake.md`
    § "Integrations" writes `- Look first (fixer):` / `- Handoff:` as plain list items, not bold
    labels. The validator reports these as warnings until fixed._

## Index ↔ frontmatter sync

`trigger_phrases` in frontmatter is authoritative. The index entry's `triggers:` list carries the
same phrases for routing, each **verbatim or shortened**: every index phrase must be a substring of
one of that area's `trigger_phrases` (today e.g. index `"have to refresh"` ↔ frontmatter
`'have to refresh to see it'`). When a section gains a phrase, add it to **both** places in the
same commit.

## Compatibility

**Safe — add freely, no consumer changes needed:**

- new sections; new bold labels inside section bodies; new prose anywhere in a body
- new trigger phrases (added to both frontmatter and index)
- new frontmatter keys; new areas (a new index bullet in the entry format + a conforming file)
- em-dash notes on taxonomy bullets; heading suffix text alongside T-tags

**Breaking — update the accessor + validator first, bump the contract version:**

- renaming/removing any required frontmatter key, or emitting non-YAML frontmatter
- changing or reordering the index field tokens (`| domain:`, `| intake:`, `| triggers:`), or
  splitting an area entry across lines
- renaming `## Areas` / `## Failure-type taxonomy`, or moving/renaming `CONTEXT-MAP-intake.md`
  or an intake file without updating the index in the same commit
- repurposing the `Handoff:` label
