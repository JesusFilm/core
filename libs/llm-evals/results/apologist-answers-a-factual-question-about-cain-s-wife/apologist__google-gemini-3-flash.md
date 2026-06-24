<!-- llm-eval-meta
{"scenarioSlug":"apologist-answers-a-factual-question-about-cain-s-wife","scenarioName":"apologist answers a factual question about Cain's wife","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"google/gemini/3-flash","score":1,"pass":true,"reason":"The model followed all instructions, providing a direct answer to a factual query without unnecessary empathy or sermonizing. It correctly identified the uncertainty (Bible does not name her), used appropriate structure for a multi-part answer, and provided a concise theological note regarding the necessity of intermarriage as permitted by the system prompt.","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist answers a factual question about Cain's wife — apologist:google/gemini/3-flash

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:google/gemini/3-flash
- **Score:** 1.00 (pass=true, threshold=0.7)

**Scenario description:** A user asks a factual / list-shaped question about a Bible character. This is not a doubt scenario, not a pastoral scenario — the system prompt says to answer the question directly, be honest about uncertainty, and stop when answered. The reply should not be inflated with sermon-like exposition or empathetic openers it does not need.

## Query

> Who was Cain's wife? Where did she come from?

## Output

> The Bible does not name Cain’s wife, but it indicates her origin through the genealogy of Adam.
>
> - **Identity:** Her name is not recorded in the biblical text.
> - **Origin:** She was a sister or a niece of Cain.
>
> Genesis 5:4 states that Adam "had other sons and daughters" over his long life. In the beginning of human history, intermarriage among close relatives was necessary to populate the earth and was not yet prohibited by God's law.
>
> Would you like to know more about why marriage between relatives was permitted at that time?

## Reason

> The model followed all instructions, providing a direct answer to a factual query without unnecessary empathy or sermonizing. It correctly identified the uncertainty (Bible does not name her), used appropriate structure for a multi-part answer, and provided a concise theological note regarding the necessity of intermarriage as permitted by the system prompt.

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
