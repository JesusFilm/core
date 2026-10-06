<!-- llm-eval-meta
{"scenarioSlug":"apologist-answers-a-factual-question-about-cain-s-wife","scenarioName":"apologist answers a factual question about Cain's wife","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"openrouter","modelId":"google/gemini-3.7-flash","score":0.9,"pass":true,"reason":"The model followed the instructions for a factual/list query, providing a direct answer up front and using bullets for the multi-part explanation. It correctly identified the uncertainty (the name) and the scriptural context (Genesis 5:4) without unnecessary sermonizing or an empathetic opener.","lastRun":"2026-10-06T02:57:17.092Z","generationAttempts":1,"judgeAttempts":1}
-->

# apologist answers a factual question about Cain's wife — openrouter:google/gemini-3.7-flash

_Last run: 2026-10-06T02:57:17.092Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** openrouter:google/gemini-3.7-flash
- **Score:** 0.90 (pass=true, threshold=0.7)
- **Generation attempts:** 1
- **Judge attempts:** 1

**Scenario description:** A user asks a factual / list-shaped question about a Bible character. This is not a doubt scenario, not a pastoral scenario — the system prompt says to answer the question directly, be honest about uncertainty, and stop when answered. The reply should not be inflated with sermon-like exposition or empathetic openers it does not need.

## Query

> Who was Cain's wife? Where did she come from?

## Output

> The Bible does not name Cain's wife, but she was almost certainly his sister, niece, or another close female relative descended from Adam and Eve.
>
> Here are the key scriptural facts:
>
> - **Adam and Eve had many children:** While Genesis specifically names Cain, Abel, and Seth, Genesis 5:4 tells us that Adam "had other sons and daughters" during his 930 years of life.
> - **The early human family:** In the first generations of humanity, marrying a sibling or close relative was necessary to populate the earth.
> - **Moral and biological context:** Marriages between close relatives were not prohibited until centuries later in the Mosaic Law (Leviticus 18). In the beginning, the human gene pool was pure and free from the accumulated genetic mutations that make close intermarriage harmful today.
>
> Thus, Cain’s wife came directly from the family of Adam and Eve.

## Reason

> The model followed the instructions for a factual/list query, providing a direct answer up front and using bullets for the multi-part explanation. It correctly identified the uncertainty (the name) and the scriptural context (Genesis 5:4) without unnecessary sermonizing or an empathetic opener.

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
