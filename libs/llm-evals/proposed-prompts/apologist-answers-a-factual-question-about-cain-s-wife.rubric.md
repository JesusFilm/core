# Proposed rubric for: apologist answers a factual question about Cain's wife

_Generated 2026-05-14T01:53:34.501Z by apologist:anthropic/claude/sonnet-4.6 — scenario slug `apologist-answers-a-factual-question-about-cain-s-wife`_

Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.

## Rationale

The observed outputs all passed, so the rubric is broadly working. The refinements tighten observability and add one new anti-pattern (false balance between speculative theories) that the Haiku output nearly exhibited by listing 'created separately by God' alongside the scriptural option without distinguishing their evidential status. The empathy-opener anti-pattern is sharpened with a concrete example phrase. The 'substitutes a different question' anti-pattern is kept but made more specific. The positive criterion about incest is kept but reworded to make the 'brief and in service of the answer' constraint observable. The criterion about markdown overuse is paired more explicitly with the positive about register-matching. One vague positive ('does not pad') is merged into the 'stops when answered' criterion to reduce redundancy, keeping the list at five positives and six negatives — within the 4-7 target range.

## Added

- Negative: Lists multiple speculative theories with equal weight without indicating which has scriptural support — giving false balance where the text is actually clear.

## Refined

- Positive 1: added 'citing Genesis 5:4 as the basis' to make the scriptural grounding observable.
- Positive 3: reworded to specify 'briefly and in service of the answer' with the concrete reason (genetic risk / Mosaic timing) so a judge can check whether the incest note is proportionate.
- Positive 4: explicitly names 'no empathy opener, no devotional framing' so the register-match criterion is checkable against the opening sentence.
- Negative 3 (pivot): added concrete examples of what the pivot looks like (fall, original sin, nature of early humanity).
- Negative 4 (markdown): added 'imposing structure the content does not require' to make the failure mode observable rather than just counting headings.

## Removed

- Positive: 'Response length matches the shape of the question — short to medium, not a sermon. No empathy opener (this is not a doubt or struggle question).' — split into two sharper criteria (register-match positive and empathy-opener negative).
- Positive: 'Does not pad with unrelated theology or related-but-unasked topics. Stops when the question is answered.' — merged into the 'stops when answered' criterion.
- Negative: 'Adds an empathetic opener as if this were a doubt/struggle question' — kept but sharpened with a concrete example phrase.

## Apply this snippet to the scenario file

Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style.

```ts
  acceptableExamples: [
    "States up front that the Bible does not name Cain's wife, then identifies her most likely origin as a sister or close relative of Adam and Eve's other children, citing Genesis 5:4 as the basis.",
    "Explicitly acknowledges what Scripture does not say — her name, her exact generation, the precise relationship — rather than asserting details the text omits.",
    "Addresses the incest question briefly and in service of the answer (genetic risk was negligible at that stage; Mosaic prohibition came later), without turning it into a separate theological essay.",
    "Matches the register of a short factual question: a paragraph or a short bulleted list at most, no empathy opener, no devotional framing, no invitation to continue unless a genuine open thread remains.",
    "Stops when the question is answered — does not append unrelated Genesis theology, the fall, original sin, or the broader creation narrative.",
  ],
  unacceptableExamples: [
    "Opens with an empathetic or pastoral sentence (e.g., 'Great question!' or 'This is a topic many find puzzling') as if the user expressed doubt or struggle — the user asked a plain factual question.",
    "Asserts a specific name, a specific generation, or a specific number of siblings that Scripture does not provide, presenting invented detail as fact.",
    "Pivots to a different question — e.g., theologises about Genesis 1, the fall, original sin, or the nature of early humanity — instead of directly answering who Cain's wife was and where she came from.",
    "Uses elaborate markdown headings and multiple bulleted sections for an answer that fits comfortably in one short paragraph, imposing structure the content does not require.",
    "Pads the reply after the question is answered with sermon-like exposition, devotional reflection, or unrequested context about Genesis genealogies, the Mosaic law, or population genetics beyond what is needed to explain the incest point.",
    "Lists multiple speculative theories (separate creation, pre-Adamic races, etc.) with equal weight, without indicating which has scriptural support and which does not — giving the impression of scholarly balance where the text is actually clear.",
  ],
```
