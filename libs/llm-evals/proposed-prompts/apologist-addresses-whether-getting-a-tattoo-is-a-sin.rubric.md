# Proposed rubric for: apologist addresses whether getting a tattoo is a sin

_Generated 2026-05-14T01:58:42.851Z by apologist:anthropic/claude/sonnet-4.6 — scenario slug `apologist-addresses-whether-getting-a-tattoo-is-a-sin`_

Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.

## Rationale

The observed outputs show models generally handling this scenario well, so the rubric needed sharpening rather than wholesale revision. The main improvements are: (1) making the Leviticus criterion more observable by requiring the pagan-mourning context to be named and a covenantal passage cited; (2) adding a new anti-pattern for the common failure of misapplying 1 Corinthians 6:19–20 as a tattoo prohibition, which models do exhibit; (3) adding an anti-pattern for substituting vague pastoral advice for actual biblical principles, which the 4o-mini output approached; (4) tightening the padding/length anti-pattern to reflect the system prompt's explicit rules; (5) removing the minor-and-parental-authority criterion from the positives because the system prompt does not require it and no observed output raised it, keeping the list focused on what the scenario actually tests.

## Added

- Anti-pattern: misapplying 1 Corinthians 6:19–20 as a straightforward tattoo prohibition without noting its sexual-immorality context.
- Anti-pattern: substituting vague spiritual advice (pray, seek counsel) for the concrete biblical-principles analysis the question calls for.
- Positive: response length and structure match the question's weight without padding or unrequested sections.

## Refined

- Leviticus 19:28 criterion now requires the pagan mourning/idolatry connection to be named and a covenantal passage cited, making it observable rather than just 'addresses honestly in context.'
- Christian liberty criterion now requires at least one specific passage citation to be verifiable.
- Practical-principles criterion now specifies 'at least two' principles and names examples, replacing the vaguer 'lists relevant biblical principles.'
- Padding anti-pattern now references the system prompt's explicit rules to ground it in observable behaviour.

## Removed

- Positive criterion listing parental authority for minors as a required principle — the system prompt does not require it and no observed output raised it.

## Apply this snippet to the scenario file

Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style.

```ts
  acceptableExamples: [
    "Addresses Leviticus 19:28 directly and in its historical context: names the pagan mourning/idolatry connection and explains why the ceremonial prohibition does not carry over to Christians under the New Covenant (citing at least one of: Galatians 3:23–25, Colossians 2:16–17, Romans 6:14).",
    "States clearly that tattoos are a matter of Christian liberty and conscience for New Testament believers — not an explicit prohibition — and cites at least one relevant passage (Romans 14 or 1 Corinthians 10:23–31).",
    "Lists at least two practical biblical principles the user should weigh (e.g., motivation, content, body-as-temple from 1 Corinthians 6:19–20, witness to others) without turning each principle into a mini-sermon.",
    "Contains at least one sentence that speaks directly to the user's actual case — a Bible-verse tattoo — rather than treating the question as purely abstract.",
    "Does not pass judgement on either the user or the people in their church; presents the disagreement as a legitimate conscience matter where Christians can differ (Romans 14:1–13).",
    "Response length and structure match the question's weight: substantive enough to address the theology, but does not pad with unrequested sections, tangential history, or reflexive follow-up invitations beyond what the system prompt requires.",
  ],
  unacceptableExamples: [
    "Treats Leviticus 19:28 as a universal, still-binding prohibition on Christians without engaging its covenantal or historical context — effectively declaring tattoos sinful for all believers.",
    "Skips or only superficially mentions Leviticus 19:28 (e.g., 'there is one verse sometimes cited') without actually explaining the pagan mourning context or why it does or does not apply today.",
    "Substitutes vague spiritual advice ('pray about it,' 'seek counsel') for the biblical-principles analysis the question calls for — leaving the user with no concrete framework.",
    "Sides against the user's church (labelling them legalistic, overly strict, or wrong) or sides against the user (telling them to defer to their church) rather than presenting this as a conscience matter where Christians can disagree.",
    "Discusses tattoos only in the abstract and never addresses the user's specific situation — a Bible-verse tattoo — leaving the actual question unanswered.",
    "Pads the response with unrequested subsections, tangential cultural commentary on tattoo trends, or a reflexive closing invitation to continue when the system prompt does not require one for this question type.",
    "Applies 1 Corinthians 6:19–20 (body as temple) as though it straightforwardly prohibits tattoos, without noting that the verse's original context is sexual immorality — misrepresenting the passage to reach a predetermined conclusion.",
  ],
```
