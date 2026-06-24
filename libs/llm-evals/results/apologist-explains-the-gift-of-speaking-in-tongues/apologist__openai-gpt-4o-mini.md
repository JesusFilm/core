<!-- llm-eval-meta
{"scenarioSlug":"apologist-explains-the-gift-of-speaking-in-tongues","scenarioName":"apologist explains the gift of speaking in tongues","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"openai/gpt/4o-mini","score":0.4,"pass":false,"reason":"The model failed on several key instructions: it hid behind 'opinions vary' instead of taking a clear position on cessation as required, matching Anti-example 1. It also used a generic follow-up question instead of the specific sub-question required by the prompt, and failed to utilize the requested biblical citations (chapter and verse) to strengthen the points.","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist explains the gift of speaking in tongues — apologist:openai/gpt/4o-mini

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:openai/gpt/4o-mini
- **Score:** 0.40 (pass=false, threshold=0.7)

**Scenario description:** A user asks a doctrinally contested question about the gift of tongues — whether it's biblical, what it is, and whether it's still happening today. The reply must engage the actual biblical text (tongues as real languages in Acts 2, Paul's instructions in 1 Corinthians 14), present a clear position on cessation, and avoid hiding behind 'denominations differ' rather than answering.

## Query

> What does the Bible say about speaking in tongues? Is this still happening today?

## Output

> The Bible discusses speaking in tongues primarily in the New Testament, particularly in the book of Acts and Paul's letters, especially 1 Corinthians.
>
> 1. **Acts 2**: On the Day of Pentecost, the Holy Spirit enabled the apostles to speak in various languages, allowing them to proclaim the gospel to people from different nations.
> 2. **1 Corinthians 12-14**: Paul addresses the spiritual gift of tongues, emphasizing that it is one of many gifts given by the Holy Spirit. He encourages orderly worship and suggests that tongues should be interpreted for the edification of the church.
>
> As for whether speaking in tongues is still happening today, opinions vary among Christians. Some believe that the gift of tongues continues as a valid expression of the Holy Spirit's work, while others argue that it was specific to the early church and has ceased. This is often referred to as "cessationism" versus "continuationism."
>
> Ultimately, the experience of speaking in tongues can be found in some contemporary Christian communities, particularly within Pentecostal and Charismatic movements. Would you like to explore more about the implications of this gift?

## Reason

> The model failed on several key instructions: it hid behind 'opinions vary' instead of taking a clear position on cessation as required, matching Anti-example 1. It also used a generic follow-up question instead of the specific sub-question required by the prompt, and failed to utilize the requested biblical citations (chapter and verse) to strengthen the points.

## Acceptable examples

- Defines tongues as real, intelligible human languages used to communicate the gospel — references Acts 2 where hearers heard their own languages.
- Engages Paul's instructions on the use of tongues in the church (1 Corinthians 12—14): tongues require interpretation in public, edify the hearer, and must be exercised in order.
- Takes a clear position on whether the gift continues today (cessationist or continuationist) rather than dodging the question — and grounds the position in Scripture, while acknowledging the Spirit's sovereignty in distributing gifts (1 Corinthians 12:11).
- Cites scripture references that genuinely strengthen the points (e.g. Acts 2:6, 1 Corinthians 14:27—28) — not verse-padding.
- Stops at the answer rather than adding unrequested sub-topics or pastoral exhortation.

## Unacceptable examples

- Refuses to take a position by hiding behind 'denominations disagree' or 'this is a personal conviction'.
- Treats tongues as ecstatic, unintelligible utterance without engaging the Acts 2 definition as real languages.
- Misrepresents 1 Corinthians 14 by either prohibiting all modern tongues unconditionally without citing the text, or endorsing uninterpreted tongues in public against the explicit instruction.
- Pads with verses to satisfy a quota, citing Scripture that doesn't strengthen the specific point being made.
- Closes with a generic 'feel free to ask more' rather than a specific sub-question tied to the topic.
