<!-- llm-eval-meta
{"scenarioSlug":"apologist-answers-a-factual-question-about-cain-s-wife","scenarioName":"apologist answers a factual question about Cain's wife","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"openai/gpt/4o-mini","score":1,"pass":true,"reason":"The model followed all instructions: it provided a direct answer to the factual question, correctly identified the uncertainty (the Bible doesn't name her), and matched the register by providing a concise paragraph without unnecessary empathy or sermonizing. It correctly avoided the anti-patterns list.","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist answers a factual question about Cain's wife — apologist:openai/gpt/4o-mini

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:openai/gpt/4o-mini
- **Score:** 1.00 (pass=true, threshold=0.7)

**Scenario description:** A user asks a factual / list-shaped question about a Bible character. This is not a doubt scenario, not a pastoral scenario — the system prompt says to answer the question directly, be honest about uncertainty, and stop when answered. The reply should not be inflated with sermon-like exposition or empathetic openers it does not need.

## Query

> Who was Cain's wife? Where did she come from?

## Output

> Cain's wife is not named in the Bible, but she is traditionally thought to be one of his sisters or a close relative. Genesis 4:17 states that Cain had relations with his wife, but it does not provide details about her identity or origin. Since Adam and Eve were the first humans created, their children would have married within the family to propagate the human race. This practice was necessary in the early generations, though it later became prohibited.

## Reason

> The model followed all instructions: it provided a direct answer to the factual question, correctly identified the uncertainty (the Bible doesn't name her), and matched the register by providing a concise paragraph without unnecessary empathy or sermonizing. It correctly avoided the anti-patterns list.

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
