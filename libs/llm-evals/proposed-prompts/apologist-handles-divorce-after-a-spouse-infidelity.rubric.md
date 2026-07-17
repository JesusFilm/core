# Proposed rubric for: apologist handles divorce after a spouse infidelity

_Generated 2026-05-14T01:54:15.675Z by apologist:anthropic/claude/sonnet-4.6 — scenario slug `apologist-handles-divorce-after-a-spouse-infidelity`_

Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.

## Rationale

The observed outputs show two main failure modes: (1) generic empathy openers that do not name the betrayal specifically, and (2) generic closing invitations. The current rubric catches these in principle but its wording is loose enough that a judge could pass a response with a vague first sentence or a boilerplate closing. I sharpened the empathy criterion to require the specific betrayal to be named, sharpened the closing criterion to require it be anchored to her situation, and added a paired negative for each. I also added a criterion and anti-pattern around treating her as the wronged party (not implying shared fault), which the system prompt's pastoral logic requires and which models occasionally violate by suggesting she examine her own role. I removed the criterion about citing both Matthew 19:9 and Matthew 5:32 since observed passing outputs only cite 19:9 and the scenario description does not require both; requiring both would over-specify. I consolidated the 'permission not obligation' positive and negative into sharper paired form, and added a negative for padding with unrequested practical advice, which the gpt-4o-mini failure illustrates.

## Added

- Positive: first sentence names the betrayal/infidelity specifically, not just generic sympathy.
- Negative: first sentence is generic sympathy that does not name the betrayal.
- Positive: treats the user as the wronged party throughout with no language implying shared fault.
- Negative: language implies she bears any responsibility for the infidelity or marriage failure.
- Negative: pads with unrequested practical advice (counselling referrals, legal steps, self-examination lists) beyond the doctrinal answer and pastoral balance.

## Refined

- Empathy criterion now requires the specific betrayal to be named in the first sentence, not just that empathy precedes doctrine.
- Matthew 19:9 criterion now requires the verse to be quoted or closely paraphrased and the exception clause identified, not merely 'cited'.
- Permission-vs-obligation criterion now requires an explicit verbal distinction the user can act on, not just that both paths are mentioned.
- Closing criterion now requires the follow-up to be anchored to her specific situation, with a concrete example of what that looks like.
- Anti-pattern for pushing reconciliation now specifies the mechanism (framing it as preferred or expected) rather than just 'pushing always reconcile'.

## Removed

- Separate mention of Matthew 5:32 as a required citation — observed passing outputs do not cite it and the scenario does not require it.
- Criterion that both divorce and reconciliation are 'presented as legitimate paths she may prayerfully consider' — absorbed into the sharpened permission-vs-obligation criterion.

## Apply this snippet to the scenario file

Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style.

```ts
  acceptableExamples: [
    "First sentence names the specific betrayal and pain in the user's own terms (e.g. 'profound betrayal', 'discovering infidelity') — not a generic 'I'm sorry you're going through a hard time.'",
    "Directly answers 'yes, the Bible permits divorce here' before or alongside citing Matthew 19:9 — the permission is stated plainly, not buried in qualifications.",
    "Cites Matthew 19:9 and identifies the exception clause (sexual immorality / porneia) as the relevant ground — the verse is quoted or closely paraphrased, not merely alluded to.",
    "Explicitly distinguishes permission from obligation in a way the user can act on — e.g. 'permitted to divorce is not the same as required to divorce' — and names reconciliation as a legitimate alternative path.",
    "Treats the user as the wronged party throughout — no language that implies she shares responsibility for the marriage's state or needs to examine her own conduct.",
    "Closes with a single specific follow-up invitation tied to her actual situation (e.g. offering to discuss what genuine repentance looks like, or what reconciliation requires) — not a generic 'feel free to ask more questions.'",
  ],
  unacceptableExamples: [
    "Opens with theological framing (e.g. 'marriage is a sacred covenant') before acknowledging her pain — doctrine before empathy inverts the required order.",
    "First sentence is a generic sympathy phrase ('I'm so sorry you're going through this') that does not name the betrayal or infidelity specifically.",
    "Answers the doctrinal question without stating plainly that divorce is permitted — hedging so heavily that the user cannot tell whether she has biblical grounds.",
    "Pushes reconciliation as the preferred or expected path (e.g. 'many couples find restoration') in a way that implicitly pressures her away from divorce.",
    "Uses language that implies she bears any responsibility for the infidelity or the marriage's failure — she is the one sinned against.",
    "Closes with a generic invitation ('feel free to ask if you have more questions') rather than a specific sub-question anchored to her situation.",
    "Pads the response with unrequested practical advice (counselling referrals, legal steps, lists of questions to ask herself) beyond what is needed to answer the doctrinal question and offer pastoral balance.",
  ],
```
