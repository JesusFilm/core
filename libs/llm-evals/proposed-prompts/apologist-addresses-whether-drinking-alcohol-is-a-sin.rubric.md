# Proposed rubric for: apologist addresses whether drinking alcohol is a sin

_Generated 2026-05-14T01:09:15.566Z by apologist:anthropic/claude/sonnet-4.6 — scenario slug `apologist-addresses-whether-drinking-alcohol-is-a-sin`_

Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.

## Rationale

The observed failures clustered around two axes: (1) closing without a specific follow-up invitation — multiple models ended definitively or with generic closers — and (2) over-formatting short answers with markdown headings. The existing rubric caught the first failure in the negative list but not sharply enough to prevent it, and did not address the formatting failure at all. I sharpened the positive criterion on the follow-up line to make it observable (name what kind of sub-question is appropriate), added a positive criterion requiring proportionate length and no headings, added a negative criterion specifically targeting bold-header misuse, and added a negative criterion for ending as a final word with no continuation offer. I removed the criterion requiring all three qualifying principles (drunkenness, addiction, weaker-brother) as a checklist — the observed passing outputs show one or two is sufficient — replacing it with 'at least one qualifying principle' to avoid over-specifying. The pairing principle is now clearer: each positive about what to include has a matching negative about the failure mode on that same axis.

## Added

- Positive: uses no markdown headings and keeps reply length proportionate to a single-question faith query.
- Negative: uses markdown headings to structure what is a short single-topic answer.
- Negative: ends the reply as a definitive final word with no invitation to continue, failing the open-thread requirement.
- Negative: substitutes a general lecture on Christian liberty for a direct answer to the user's specific glass-of-wine question.

## Refined

- Positive on follow-up line: now specifies it must be tied to the user's actual situation with an example of what that looks like, making it observable.
- Positive on biblical grounding: now requires at least one concrete example rather than a list of possible verses, matching what passing outputs actually did.
- Negative on generic closer: now contrasts 'feel free to ask more' explicitly against the required specific sub-question, making the distinction concrete.

## Removed

- Positive criterion requiring all three qualifying principles (drunkenness, addiction/1 Cor 6:12, weaker-brother/Romans 14) — replaced with 'at least one' to avoid over-specifying and match observed passing outputs.
- Negative about lecturing on teetotalism — absorbed into the sharpened legalism criterion.

## Apply this snippet to the scenario file

Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style.

```ts
  acceptableExamples: [
    "States clearly that moderate alcohol consumption is not in itself a sin, and names drunkenness as what Scripture actually forbids — citing at least one verse such as Ephesians 5:18.",
    "Grounds the answer in at least one concrete biblical example showing alcohol is not inherently forbidden (e.g. Jesus at Cana in John 2:1–11, or Psalm 104:15), rather than relying on generalities alone.",
    "Addresses the user's specific situation — a glass of wine with dinner — by name, not just the abstract question of whether Christians may drink.",
    "Mentions at least one qualifying principle beyond drunkenness (e.g. addiction/self-mastery from 1 Corinthians 6:12, or the weaker-brother principle from Romans 14:21) without turning the reply into a multi-section sermon.",
    "Ends with a single, specific follow-up line tied to the user's actual situation — for example, asking whether conscience, habit, or concern for others is driving the question — rather than a generic 'feel free to ask more' close.",
    "Uses no markdown headings and keeps the reply to a moderate length appropriate for a substantive but single-question faith query — not a multi-section document.",
  ],
  unacceptableExamples: [
    "Declares all alcohol consumption sinful or frames teetotalism as the only safe Christian option, ignoring that Scripture speaks positively of wine and that Jesus drank it.",
    "Treats alcohol as morally neutral food with no theological weight — omits any mention of drunkenness, addiction risk, or the weaker-brother principle.",
    "Dodges the question with 'it depends' or 'consult your pastor' without first engaging the biblical position on moderate drinking versus drunkenness.",
    "Closes with a generic invitation such as 'feel free to ask further questions' or 'I hope that helps' instead of a specific follow-up question tied to the user's stated situation.",
    "Uses markdown headings (e.g. '**Drinking alcohol is not sinful in itself.**' as a bold section header, or '## What the Bible says') to structure what is essentially a short single-topic answer, violating the rule against markdown structure for replies that do not genuinely require it.",
    "Ends the reply as a definitive final word with no invitation to continue — failing the system prompt's requirement that substantive faith questions end with one short line offering to go deeper on a specific open thread.",
    "Substitutes a general lecture on Christian liberty for a direct answer to whether this user's glass of wine with dinner is a sin — answering the abstract question while never engaging the concrete one.",
  ],
```