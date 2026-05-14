<!-- llm-eval-meta
{"scenarioSlug":"apologist-explains-the-gift-of-speaking-in-tongues","scenarioName":"apologist explains the gift of speaking in tongues","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"anthropic/claude/haiku-4.5","score":0.5,"pass":false,"reason":"The model fails to take a clear position on whether tongues continue today, instead hiding behind the statement that 'Christians genuinely disagree', which directly violates the requirement to avoid dodging the question. This matches the spirit of the first anti-pattern.","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist explains the gift of speaking in tongues — apologist:anthropic/claude/haiku-4.5

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:anthropic/claude/haiku-4.5
- **Score:** 0.50 (pass=false, threshold=0.7)

**Scenario description:** A user asks a doctrinally contested question about the gift of tongues — whether it's biblical, what it is, and whether it's still happening today. The reply must engage the actual biblical text (tongues as real languages in Acts 2, Paul's instructions in 1 Corinthians 14), present a clear position on cessation, and avoid hiding behind 'denominations differ' rather than answering.

## Query

> What does the Bible say about speaking in tongues? Is this still happening today?

## Output

> ## What the Bible Says About Speaking in Tongues
>
> **In the New Testament**, speaking in tongues (*glossolalia*) appears primarily in Acts and 1 Corinthians:
>
> - **Acts 2:4–11** (Pentecost): The Spirit-filled disciples spoke in languages they had not learned, and foreigners heard the gospel in their own languages.
> - **Acts 10:46, 19:6**: Tongues accompanied the Spirit's filling in other contexts.
> - **1 Corinthians 12–14**: Paul addresses tongues as a spiritual gift. He emphasizes that not all believers speak in tongues (12:30), that tongues without interpretation should be limited in corporate worship (14:27–28), and that **love and intelligible prophecy are greater gifts** (13:1–2, 14:1–5).
>
> Paul's tone suggests tongues were real but needed regulation in the Corinthian church—they were being overemphasized and creating disorder.
>
> ## Is It Still Happening Today?
>
> This is where Christians genuinely disagree:
>
> - **Cessationists** argue that tongues were a sign gift for the apostolic era (to authenticate the gospel to Jews and Gentiles) and ceased when the New Testament was completed.
> - **Continuationists** hold that the Spirit still grants tongues today as He distributes gifts as He wills (1 Corinthians 12:11).
>
> Both positions have thoughtful defenders. The Bible does not explicitly state when or whether tongues would cease. What Scripture *does* make clear is that tongues, if genuine, must serve the church's edification (1 Corinthians 14:12) and never contradict the gospel or Scripture.
>
> Would you like to explore the cessationist or continuationist case more closely?

## Reason

> The model fails to take a clear position on whether tongues continue today, instead hiding behind the statement that 'Christians genuinely disagree', which directly violates the requirement to avoid dodging the question. This matches the spirit of the first anti-pattern.

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
