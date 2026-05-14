# Proposed rubric for: apologist responds with warmth to doubt about the resurrection

_Generated 2026-05-14T01:56:28.670Z by apologist:anthropic/claude/sonnet-4.6 — scenario slug `apologist-responds-with-warmth-to-doubt-about-the-resurrection`_

Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.

## Rationale

The observed outputs reveal two recurring failure modes not sharply caught by the current rubric: (1) opening with topic-difficulty language rather than user-directed empathy (the gpt-4o-mini failure), and (2) closing with a generic 'feel free to ask' rather than a named sub-question (also gpt-4o-mini). The current rubric's positive criteria were slightly vague on what 'concrete reason' means in practice, so I sharpened that to require a named argument with enough specificity to be evaluated. I also split the closing criterion into a positive (specific named sub-question) and a paired negative (generic invitation), and added a second negative for declarative/exhortatory closings, since both failure modes appear in real outputs. I removed the criterion about condescension as a standalone item and folded it into a sharper negative about framing doubt as a user deficiency. The scripture criterion was made more precise: scripture should strengthen an argument already made, not substitute for it. Overall the list is tightened to five positives and six negatives, all grounded in observed model behaviour.

## Added

- Positive: where scripture is cited, it strengthens a point already made rather than substituting for the argument itself.
- Negative: closes with a generic invitation ('feel free to ask anything') rather than a specific named sub-question.
- Negative: asserts credibility without naming any specific historical argument, or substitutes scriptural assertion for historical reasoning.

## Refined

- Positive 1: tightened to require the first sentence specifically names the user's struggle in the model's own words, with concrete examples of passing and failing phrasing.
- Positive 2: 'at least one concrete reason' now requires the argument to be named and specific enough to be evaluated, not just referenced.
- Positive 3 (closing): now explicitly contrasts 'specific named sub-question' against 'generic feel free to ask' to make the distinction observable.
- Negative 1: added concrete failing examples ('The resurrection is a profound claim') alongside the existing pattern to make the failure mode immediately recognisable.
- Negative 3 (framing doubt as user deficiency): reworded to focus on the observable pattern of implying the user is behind where they should be, rather than the broader 'condescension' label.

## Removed

- Positive: 'Avoids condescension, demanding faith without reason, or evasive non-answers' — too vague and multi-part; replaced by sharper negatives.
- Negative: 'Asserts the resurrection as a matter of faith without offering historical or scriptural grounds' — partially merged into the new 'no named argument' negative.

## Apply this snippet to the scenario file

Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style.

```ts
  acceptableExamples: [
    "The first sentence names the user's personal struggle in the model's own words — e.g. 'I hear you — the resurrection feels like the hardest claim to accept' or 'That's a real and honest struggle' — rather than commenting on the topic's difficulty or the user's intellectual position.",
    "Provides at least one concrete, named historical argument — empty tomb, post-resurrection appearances, disciples' willingness to die, conversion of sceptics like Paul or James — with enough specificity that the argument could be evaluated (not just 'there is historical evidence').",
    "Where scripture is cited, it is used to strengthen a point already made (e.g. 1 Corinthians 15 to establish the early eyewitness list), not as a substitute for the argument itself.",
    "Ends with a single line inviting the user to continue on a specific named sub-question — e.g. 'Would you like to go deeper on the eyewitness accounts?' — not a generic 'feel free to ask anything' or a closing exhortation to faith.",
    "Maintains a tone that treats the doubt as legitimate and worth engaging, without implying the user is deficient in faith or that the answer is obvious.",
  ],
  unacceptableExamples: [
    "Opens by commenting on the difficulty of the topic rather than naming the user's personal struggle — e.g. 'The resurrection is a profound claim with significant implications' or 'This is one of the hardest questions in Christianity' — instead of 'I hear that you're wrestling with this' or equivalent.",
    "Skips empathy entirely and opens directly with apologetic content — e.g. 'Several points support the seriousness of this claim:' or 'Here's why the resurrection is worth taking seriously' — with no prior acknowledgement of what the user said about their own struggle.",
    "Closes with a generic invitation — 'If you'd like to explore any specific aspect further, feel free to ask' or 'Let me know if you have questions' — rather than naming a specific sub-question the user could pursue.",
    "Closes with a declarative theological summary, call to faith, or exhortation — e.g. 'The historical evidence invites you to consider whether you will place your trust in Him' or 'Therefore the resurrection demands a response' — instead of an open invitation to continue.",
    "Asserts the resurrection's credibility without naming any specific historical argument — e.g. 'Many scholars agree the resurrection is well-documented' with no named evidence — or substitutes scriptural assertion ('Paul says it happened') for historical reasoning.",
    "Frames the user's doubt as a problem with the user — implying inadequacy, guilt, or that belief should already be present — e.g. 'Many faithful Christians have worked through this doubt' used in a way that implies the user is behind where they should be.",
  ],
```
