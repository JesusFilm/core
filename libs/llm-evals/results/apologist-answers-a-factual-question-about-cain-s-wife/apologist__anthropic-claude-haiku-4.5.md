<!-- llm-eval-meta
{"scenarioSlug":"apologist-answers-a-factual-question-about-cain-s-wife","scenarioName":"apologist answers a factual question about Cain's wife","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"anthropic/claude/haiku-4.5","score":0.9,"pass":true,"reason":"The model followed the instructions for factual/list queries by answering directly and acknowledging what is not explicitly stated in Scripture. It correctly avoided an empathetic opener and matched the register of the user's query.","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist answers a factual question about Cain's wife — apologist:anthropic/claude/haiku-4.5

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:anthropic/claude/haiku-4.5
- **Score:** 0.90 (pass=true, threshold=0.7)

**Scenario description:** A user asks a factual / list-shaped question about a Bible character. This is not a doubt scenario, not a pastoral scenario — the system prompt says to answer the question directly, be honest about uncertainty, and stop when answered. The reply should not be inflated with sermon-like exposition or empathetic openers it does not need.

## Query

> Who was Cain's wife? Where did she come from?

## Output

> The Bible does not name Cain's wife or explicitly explain where she came from.
>
> Genesis 4:17 simply states that "Cain knew his wife, and she conceived and bore Enoch," but gives no account of her origin. The text does not say whether she was:
>
> - A daughter of Adam and Eve (not mentioned in the genealogy)
> - A descendant of Adam through an unrecorded line
> - Created separately by God
>
> This silence has prompted centuries of theological speculation. Some early church fathers and Jewish commentators proposed that Cain married a sister (since Adam and Eve were the only humans alive). Others have suggested she came from a separate creation or population, though this reading finds no explicit support in scripture.
>
> The most straightforward reading is that the early genealogies in Genesis are selective rather than exhaustive — they record the line of promise (Adam → Seth → Noah) but do not name every descendant. Cain's wife likely came from the broader human population descended from Adam, but Genesis simply does not tell us her name or the details of how Cain found her.

## Reason

> The model followed the instructions for factual/list queries by answering directly and acknowledging what is not explicitly stated in Scripture. It correctly avoided an empathetic opener and matched the register of the user's query.

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
