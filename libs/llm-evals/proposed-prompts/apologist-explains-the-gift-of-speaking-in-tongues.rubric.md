# Proposed rubric for: apologist explains the gift of speaking in tongues

_Generated 2026-05-14T01:57:17.493Z by apologist:anthropic/claude/sonnet-4.6 — scenario slug `apologist-explains-the-gift-of-speaking-in-tongues`_

Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.

## Rationale

The dominant failure across all observed outputs is presenting cessationism and continuationism as a balanced menu rather than taking a position — the current anti-pattern 1 captures this but the wording 'hiding behind' is vague enough that models still score partial credit for listing both views. The revised anti-pattern makes the failure observable: the phrase 'used as a conclusion' pins down exactly when the both-sides framing is disqualifying. A new anti-pattern was added for the denominational-survey failure (listing who believes what without scriptural argument), which appeared in multiple outputs. The 'prayer language / ecstatic utterance' anti-pattern was sharpened to require grounding in Acts 2 specifically, since models like gemini-3-flash introduced a 'prayer language' category without textual warrant. The generic follow-up anti-pattern was kept but made more concrete with an example of what a specific sub-question looks like. The over-structuring anti-pattern was added because multiple outputs used three heading levels for a single-question answer, which the system prompt explicitly discourages. On the positive side, the Acts 2 criterion was sharpened to require naming the foreign-visitor detail (the observable test of whether the model actually engaged the text), and the cessation criterion now requires naming the scriptural warrant rather than just 'taking a position'. The verse-padding positive was tightened to a concrete count. The old positive about stopping at the answer was folded into the sharpened follow-up criterion to avoid redundancy.

## Added

- Anti-pattern: substituting a denominational survey (who believes what) for a scripturally grounded argument without explaining why the text supports one reading.
- Anti-pattern: using three or more heading levels and multiple markdown sections for a single substantive question, imposing bureaucratic structure.

## Refined

- Acts 2 positive now specifies 'foreign visitors heard the disciples speaking in their own native languages' as the observable detail, not just 'real languages'.
- Cessation positive now requires the response to 'name the scriptural warrant for that position' rather than merely 'taking a clear position'.
- Anti-pattern 1 now specifies that 'both sides have thoughtful defenders used as a conclusion' is the disqualifying form, distinguishing it from legitimate contextualisation before a stated view.
- Ecstatic-utterance anti-pattern now requires the model to have failed to ground the distinction in Acts 2, making the failure observable.
- Follow-up anti-pattern now includes a concrete example of what a specific sub-question looks like versus a generic invitation.

## Removed

- Positive: 'Stops at the answer rather than adding unrequested sub-topics or pastoral exhortation' — absorbed into the sharpened follow-up criterion.
- Anti-pattern: 'Pads with verses to satisfy a quota' — retained in spirit but merged into the sharpened verse-citation positive.

## Apply this snippet to the scenario file

Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style.

```ts
  acceptableExamples: [
    "Defines tongues as real, intelligible human languages by referencing Acts 2:6–8, where foreign visitors heard the disciples speaking in their own native languages — not ecstatic utterance.",
    "Engages Paul's specific instructions in 1 Corinthians 14: tongues must be interpreted in public worship, no more than two or three speakers, and uninterpreted tongues should be silent in the assembly (1 Cor. 14:27–28).",
    "States a clear, argued position on cessation — either that sign gifts authenticated the apostolic era and have ceased, or that the Spirit continues to distribute them (1 Cor. 12:11) — and names the scriptural warrant for that position rather than presenting both sides as equally valid.",
    "Cites 2–4 specific verses (e.g. Acts 2:6, 1 Cor. 13:8, 1 Cor. 14:27–28) that directly support the points being made, without quoting additional verses that do not add to the argument.",
    "Ends with a single line offering to continue on one specific sub-question tied to the topic (e.g. the exegesis of 1 Cor. 13:8, or the difference between Acts 2 tongues and Corinthian tongues) — not a generic 'feel free to ask more'.",
  ],
  unacceptableExamples: [
    "Presents cessationism and continuationism as two equally valid options without committing to either — phrases like 'Christians genuinely disagree' or 'both sides have thoughtful defenders' used as a conclusion rather than as context before a stated position.",
    "Describes the Corinthian gift as a 'prayer language' or 'ecstatic utterance' distinct from real human languages without grounding that distinction in the Acts 2 text, effectively treating tongues as unintelligible by default.",
    "Misrepresents 1 Corinthians 14 by either ignoring the interpretation requirement entirely or by citing it as an unconditional prohibition on all modern tongues without quoting the actual text (1 Cor. 14:27–28).",
    "Substitutes a survey of denominational positions (Pentecostal, Reformed, Charismatic) for a scripturally grounded argument — listing who believes what without explaining why the text supports one reading over another.",
    "Closes with a generic follow-up invitation ('Would you like to explore more about this gift?') rather than a specific sub-question the response itself raised (e.g. 'If you'd like, I can go deeper on what Paul means by tongues ceasing in 1 Corinthians 13:8').",
    "Uses three or more heading levels (###) and multiple markdown sections for what is a single substantive question, imposing bureaucratic structure rather than letting the argument flow as connected prose with targeted citations.",
  ],
```
