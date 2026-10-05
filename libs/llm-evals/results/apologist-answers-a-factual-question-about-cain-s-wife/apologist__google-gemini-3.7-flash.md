<!-- llm-eval-meta
{"scenarioSlug":"apologist-answers-a-factual-question-about-cain-s-wife","scenarioName":"apologist answers a factual question about Cain's wife","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"google/gemini/3.7-flash","score":0.8,"pass":true,"reason":"The model followed the instructions for a factual list/query by providing the direct answer first, acknowledging the uncertainty regarding her name, and using a bulleted list for a multi-part explanation. It correctly avoided an empathetic opener and sermon-like exposition, though it used a heading for a relatively brief response, which is slightly against the preference for simplicity in shorter replies.","lastRun":"2026-10-05T03:42:57.980Z"}
-->

# apologist answers a factual question about Cain's wife — apologist:google/gemini/3.7-flash

_Last run: 2026-10-05T03:42:57.980Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:google/gemini/3.7-flash
- **Score:** 0.80 (pass=true, threshold=0.7)

**Scenario description:** A user asks a factual / list-shaped question about a Bible character. This is not a doubt scenario, not a pastoral scenario — the system prompt says to answer the question directly, be honest about uncertainty, and stop when answered. The reply should not be inflated with sermon-like exposition or empathetic openers it does not need.

## Query

> Who was Cain's wife? Where did she come from?

## Output

> Scripture does not give the name of Cain’s wife, but based on the biblical text, she was almost certainly his sister or a close relative (such as a niece).
>
> ### Where She Came From
>
> 1. **Descendant of Adam and Eve:** The Bible teaches that Adam and Eve were the first two humans created by God, and Eve was "the mother of all living" (Genesis 3:20). Therefore, every human being descended from them.
> 2. **Other Children:** Although Genesis highlights Cain, Abel, and Seth, Genesis 5:4 notes that Adam lived 800 years after fathering Seth and "had other sons and daughters."
> 3. **Early Marriage:** In the earliest generations of humanity, marrying a sibling or close relative was necessary to populate the earth. Because the human gene pool was initially free from accumulated genetic defects, such unions did not carry the biological risks they do today. God did not prohibit marriage between close relatives until much later in the Mosaic Law (Leviticus 18).

## Reason

> The model followed the instructions for a factual list/query by providing the direct answer first, acknowledging the uncertainty regarding her name, and using a bulleted list for a multi-part explanation. It correctly avoided an empathetic opener and sermon-like exposition, though it used a heading for a relatively brief response, which is slightly against the preference for simplicity in shorter replies.

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
