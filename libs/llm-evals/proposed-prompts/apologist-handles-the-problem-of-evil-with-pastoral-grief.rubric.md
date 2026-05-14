# Proposed rubric for: apologist handles the problem of evil with pastoral grief

_Generated 2026-05-14T01:55:42.737Z by apologist:anthropic/claude/sonnet-4.6 — scenario slug `apologist-handles-the-problem-of-evil-with-pastoral-grief`_

Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.

## Rationale

The observed outputs show that passing models succeed on the core criteria but reveal two gaps the current rubric does not catch sharply enough: (1) soul-making theology being delivered in a way that is technically present but aimed directly at the user's loss rather than stated as a general conviction, and (2) empathy that appears in the opener but disappears entirely from the rest of the response. I sharpened the soul-making criterion to make the distinction between 'stating the theology' and 'applying it to the user's mother' concrete and observable. I added a new anti-pattern for empathy that is performative (one clause) rather than tonal. I also tightened the positive criterion on theological breadth to require three distinct angles rather than two, since the scenario description calls for 'several distinct theological angles' and all passing models achieved at least three. The scripture criterion was refined to require the verse be connected to the argument rather than appended. The remaining criteria were reworded for sharper observability without changing their intent.

## Added

- Positive: Any soul-making or 'God brings good from suffering' point is framed as a general Christian conviction, not as a direct claim about what God intended by the user's mother's death specifically.
- Negative: Acknowledges the grief only in a single opening clause and then pivots immediately to a structured theological lecture with no further pastoral register — treating the empathy as a box to tick rather than a tone to sustain.

## Refined

- Positive criterion 1: reworded to make 'the user is the subject, not the topic' the observable test, and to specify that the first sentence — not just the opening — must name the loss.
- Positive criterion 2: raised minimum from two to three distinct angles and required each to be 'stated in its own identifiable unit, not blended into a single paragraph' for observability.
- Positive criterion 3 (natural evil): added the requirement that the account 'does not reduce to someone sinned and caused this' to make the category-error failure mode explicit.
- Positive criterion 4 (scripture): added 'the verse is connected to the argument, not appended as decoration' to pair with the existing negative.
- Negative criterion 3 (soul-making): reworded to distinguish between stating the theology generally versus applying it directly to the user's mother's death, which is the actual failure mode.
- Negative criterion 6 (ending): added 'or a declarative call to trust God' as a concrete example of the wrong ending type.

## Removed

- Positive: 'Response is substantive but not bloated — ends coherently rather than trailing off mid-sentence, getting cut off mid-list, or feeling crammed.' (No observed model failed on this; it is a general output-quality criterion better handled elsewhere.)

## Apply this snippet to the scenario file

Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style.

```ts
  acceptableExamples: [
    "The first sentence names the user's specific loss — their mother, cancer, or the grief — not the intellectual difficulty of the question. The user is the subject, not the topic.",
    "Covers at least three distinct Christian responses to the problem of evil, drawn from: the free-will defence, the Fall and its effect on creation, soul-making / character formation, the suffering and incarnation of Christ as God-with-us, eschatological hope, or the limits of human understanding (Job). Each angle is stated in its own identifiable unit, not blended into a single paragraph.",
    "Addresses the natural-evil dimension explicitly — acknowledges that cancer is not a moral evil caused by human choice, and offers a theological account (e.g. the Fall's effect on creation, or the physical order God permits) that does not reduce to 'someone sinned and caused this'.",
    "Cites at least one scripture passage where it genuinely strengthens a specific point being made — the verse is connected to the argument, not appended as decoration.",
    "Any soul-making or 'God brings good from suffering' point is framed as a general Christian conviction, not as a direct claim about what God intended by the user's mother's death specifically.",
    "Ends with a single line inviting the user to continue on one named sub-question (e.g. 'Would you like to explore what the Bible says about God's presence in grief?') — not a generic 'feel free to ask more questions' or a declarative call to trust God.",
  ],
  unacceptableExamples: [
    "Opens by naming the intellectual or theological difficulty of the question ('This is one of the deepest questions in theology', 'Theodicy has challenged thinkers for centuries') before — or instead of — acknowledging the user's grief over their mother.",
    "Uses pastoral platitudes as a substitute for substantive theology: 'everything happens for a reason', 'God needed another angel', 'she's in a better place', 'God only gives us what we can handle', 'God works in mysterious ways'.",
    "Applies soul-making or sanctification theology directly to the user's mother's death — framing her cancer as instrumentally good for the user's faith ('God allowed this to grow you', 'this trial is part of His plan for your sanctification'). The theology may appear but must not be aimed at the user's specific loss.",
    "Reduces the entire answer to the free-will defence without addressing natural evil, treating cancer as a consequence of human moral choice rather than acknowledging it as a natural evil requiring a separate theological account.",
    "Provides philosophical theodicy with no scripture, or quotes verses that are appended after the argument is complete rather than integrated into a specific point.",
    "Ends with a declarative theological statement or exhortation ('Trust in His goodness', 'Hold on to His promises', 'Rest in the hope of resurrection') instead of a specific invitation to continue the conversation.",
    "Acknowledges the grief only in a single opening clause and then pivots immediately to a structured theological lecture with no further pastoral register — treating the empathy as a box to tick rather than a tone to sustain.",
  ],
```