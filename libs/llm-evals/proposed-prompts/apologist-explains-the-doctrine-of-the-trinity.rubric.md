# Proposed rubric for: apologist explains the doctrine of the Trinity

_Generated 2026-05-14T01:59:28.986Z by apologist:anthropic/claude/sonnet-4.6 — scenario slug `apologist-explains-the-doctrine-of-the-trinity`_

Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.

## Rationale

The observed outputs show the main real failure mode is the water/modalist analogy (gpt-4o-mini) and generic follow-up invitations. The current rubric already catches these but some criteria were too vague to be reliably observable. I sharpened the essence/person distinction criterion so a judge can check for the explicit two-category explanation, added a criterion catching the subtler modalist collapse ('one in person, three in role') that looks like compliance but isn't, tightened the Scripture criterion to require two distinct anchors serving different argumentative roles, added a criterion requiring concrete personal-distinction evidence from Scripture, and made the follow-up criterion explicitly contrast specific vs. generic. I removed the standalone 'pads with history' criterion and folded it into a sharper anti-pattern, and dropped the vague 'acknowledges limits without evasion' positive in favour of a version that specifies what honest mystery language looks like versus evasion.

## Added

- Positive: requires at least one concrete scriptural example demonstrating real personal distinctions (Son praying to Father, etc.).
- Negative: catches the subtle modalist collapse of describing Persons as 'roles' or 'functions' rather than distinct Persons — a failure that looks like compliance.
- Negative: catches decorative Scripture citation — quoting verses without connecting them to the specific claim being made.

## Refined

- Positive 1: added the explicit negative markers ('not three gods, not one Person in three modes') so a judge can check for them directly.
- Positive 2: reworded to require the model to name both categories explicitly ('one what / three whos') rather than just 'engage the confusion'.
- Positive 3: split the Scripture criterion to require two distinct anchors serving different argumentative roles (monotheism + personal distinction), matching what passing outputs actually do.
- Positive 5 (mystery): reworded to specify that mystery language is acceptable only as a coda after real content, not as a substitute for it.
- Negative 4 (mystery evasion): reworded to make the failure mode concrete — mystery used before or instead of the essence/person explanation.

## Removed

- Standalone negative about padding with multi-paragraph history before engaging the question — folded into a sharpened anti-pattern.
- Vague positive about 'acknowledging limits of human comprehension without using mystery as evasion' — replaced with a more observable version specifying what evasion looks like versus honest coda.

## Apply this snippet to the scenario file

Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style.

```ts
  acceptableExamples: [
    "Affirms the historic Trinitarian position clearly: one God in three coequal, coeternal Persons — Father, Son, and Holy Spirit — and explicitly states this is not three gods and not one Person in three modes.",
    "Resolves the apparent contradiction by naming the two different categories: God is one in *essence* (one 'what') and three in *person* (three 'whos') — making clear that 'one' and 'three' do not refer to the same thing.",
    "Supports the doctrine with at least two distinct scriptural anchors: one establishing monotheism (e.g. Deuteronomy 6:4) and one showing the three Persons as distinct (e.g. Matthew 3:16–17 or Matthew 28:19).",
    "Demonstrates the real personal distinctions between the Persons with at least one concrete scriptural example — such as the Son praying to the Father, or the Father and Son sending the Spirit — showing they cannot be collapsed into one Person.",
    "Acknowledges the limits of human comprehension honestly, without using 'mystery' as a substitute for content — i.e. admits what cannot be fully grasped while still delivering real theological substance.",
    "Ends with a single, specific invitation to continue on a named sub-question (e.g. 'Would you like to explore how the three Persons relate in salvation?') rather than a generic 'let me know if you have questions'.",
  ],
  unacceptableExamples: [
    "Uses a modalist analogy — egg (shell/white/yolk), water (ice/liquid/steam), or a man as husband/father/brother — which presents either parts of one thing or one person in different roles, not three coequal Persons sharing one essence.",
    "Slips into modalism by describing the Persons as sequential modes or masks — e.g. 'God appeared first as Father, then as Son, then as Spirit' — rather than three simultaneously distinct, coeternal Persons.",
    "Resolves the 'one and three' tension by collapsing the categories — e.g. saying God is 'one in person but three in role' or 'one God with three functions' — which denies genuine personal distinction and is functionally modalist.",
    "Waves away the apparent contradiction with 'it's a mystery beyond human understanding' without first explaining that 'one' and 'three' refer to different categories (essence vs. person); mystery language used as evasion rather than as an honest coda to real content.",
    "Substitutes church history or creedal development (Nicaea, Athanasius, the Cappadocians) for the substantive doctrinal answer — leading with how the doctrine was formulated rather than what it actually claims.",
    "Ends with a generic, open-ended invitation such as 'feel free to ask if you have more questions' rather than a specific named sub-question the user might want to pursue.",
    "Omits Scripture entirely or cites verses only decoratively without connecting them to the specific claim being made (e.g. quoting John 3:16 as a proof of the Trinity without explaining what it demonstrates).",
  ],
```