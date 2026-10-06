<!-- llm-eval-meta
{"scenarioSlug":"apologist-answers-a-factual-question-about-cain-s-wife","scenarioName":"apologist answers a factual question about Cain's wife","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"google/gemini/3.7-flash","score":0.9,"pass":true,"reason":"The model followed the factual/list query instructions well, providing a direct answer, using bullets for the context, and correctly identifying scriptural support while acknowledging the Bible's silence on the name. It avoided an empathetic opener and stopped once the question was answered.","lastRun":"2026-10-06T03:04:51.308Z","generationAttempts":1,"judgeAttempts":1}
-->

# apologist answers a factual question about Cain's wife — apologist:google/gemini/3.7-flash

_Last run: 2026-10-06T03:04:51.308Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:google/gemini/3.7-flash
- **Score:** 0.90 (pass=true, threshold=0.7)
- **Generation attempts:** 1
- **Judge attempts:** 1

**Scenario description:** A user asks a factual / list-shaped question about a Bible character. This is not a doubt scenario, not a pastoral scenario — the system prompt says to answer the question directly, be honest about uncertainty, and stop when answered. The reply should not be inflated with sermon-like exposition or empathetic openers it does not need.

## Query

> Who was Cain's wife? Where did she come from?

## Output

> The Bible does not name Cain’s wife, but scripture indicates she was his sister (or possibly a niece).
>
> Here is the biblical context:
>
> - **Eve is the mother of all humanity:** Genesis 3:20 states that Eve was "the mother of all living." Every human descended from Adam and Eve.
> - **Adam and Eve had many children:** While Genesis highlights Cain, Abel, and Seth, Genesis 5:4 notes, _"The days of Adam after he fathered Seth were 800 years; and he had other sons and daughters."_
> - **Close-relative marriage in early history:** In the earliest generations of humanity, marrying a sibling or close relative was necessary to obey God's command to fill the earth (Genesis 1:28). Because the human gene pool was still near its original, pristine creation, genetic defects from close intermarriage were not yet a factor. God later prohibited marriage between close relatives in the Law of Moses (Leviticus 18).

## Reason

> The model followed the factual/list query instructions well, providing a direct answer, using bullets for the context, and correctly identifying scriptural support while acknowledging the Bible's silence on the name. It avoided an empathetic opener and stopped once the question was answered.

## Acceptable examples

- Gives a direct answer up front: Cain's wife was a sister or niece (or further descendant), since Adam and Eve had many other sons and daughters (Genesis 5:4) — the Bible does not name her.
- Explicitly acknowledges the uncertain parts (the Bible does not name her or say exactly which relative) rather than asserting details Scripture does not give.
- Briefly addresses the natural follow-up about incest (genetic damage was not an issue at that early stage; the Levitical laws against incest came much later) — but only briefly, in service of the answer.
- Response length matches the shape of the question — short to medium, not a sermon. No empathy opener (this is not a doubt or struggle question).
- Does not pad with unrelated theology or related-but-unasked topics. Stops when the question is answered.

## Unacceptable examples

- Substitutes a different question — e.g. theologises about Genesis 1, the fall, or original sin instead of answering who Cain's wife was.
- Asserts details the Bible does not give (a specific name, a specific generation, a specific number of siblings).
- Adds an empathetic opener as if this were a doubt/struggle question — the user is asking a factual question and does not need consoling.
- Uses elaborate markdown headings and bulleted lists for a question that can be answered in a short paragraph.
- Pads the reply with sermon-like exposition, devotional reflections, or "for further reading" tangents.
