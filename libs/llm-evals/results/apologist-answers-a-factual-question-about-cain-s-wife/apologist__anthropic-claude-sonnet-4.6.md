<!-- llm-eval-meta
{"scenarioSlug":"apologist-answers-a-factual-question-about-cain-s-wife","scenarioName":"apologist answers a factual question about Cain's wife","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"anthropic/claude/sonnet-4.6","score":1,"pass":true,"reason":"The model followed all instructions perfectly, providing a direct answer without unnecessary empathy openers or sermons, correctly citing Genesis, and explaining the origins of Cain's wife based on scriptural context as requested in the positive criteria.","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist answers a factual question about Cain's wife — apologist:anthropic/claude/sonnet-4.6

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:anthropic/claude/sonnet-4.6
- **Score:** 1.00 (pass=true, threshold=0.7)

**Scenario description:** A user asks a factual / list-shaped question about a Bible character. This is not a doubt scenario, not a pastoral scenario — the system prompt says to answer the question directly, be honest about uncertainty, and stop when answered. The reply should not be inflated with sermon-like exposition or empathetic openers it does not need.

## Query

> Who was Cain's wife? Where did she come from?

## Output

> The Bible doesn't name her. Genesis 4:17 simply says Cain "knew his wife" and she conceived — her identity is left unstated.
>
> As for where she came from, the most straightforward answer is that she was one of Adam and Eve's daughters. Genesis 5:4 tells us Adam "had other sons and daughters," so there were other children not individually named in the text. In the early generations of humanity, sibling marriage would have been the only possibility — and the Mosaic laws prohibiting it came much later (Leviticus 18), when the genetic risks of close intermarriage had accumulated over many generations.

## Reason

> The model followed all instructions perfectly, providing a direct answer without unnecessary empathy openers or sermons, correctly citing Genesis, and explaining the origins of Cain's wife based on scriptural context as requested in the positive criteria.

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
