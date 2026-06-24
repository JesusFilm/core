<!-- llm-eval-meta
{"scenarioSlug":"apologist-explains-the-gift-of-speaking-in-tongues","scenarioName":"apologist explains the gift of speaking in tongues","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"openrouter","modelId":"google/gemini-3-flash-preview","score":0.5,"pass":false,"reason":"The model failed to take a clear position on whether the gift continues today, instead providing a comparison of views, which violates the requirement to avoid hiding behind 'denominations differ' (Anti-example 1). Additionally, while it correctly identified the Acts 2 definition, the structure included unrequested subheadings for what should have been a substantive faith answer.","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist explains the gift of speaking in tongues — openrouter:google/gemini-3-flash-preview

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** openrouter:google/gemini-3-flash-preview
- **Score:** 0.50 (pass=false, threshold=0.7)

**Scenario description:** A user asks a doctrinally contested question about the gift of tongues — whether it's biblical, what it is, and whether it's still happening today. The reply must engage the actual biblical text (tongues as real languages in Acts 2, Paul's instructions in 1 Corinthians 14), present a clear position on cessation, and avoid hiding behind 'denominations differ' rather than answering.

## Query

> What does the Bible say about speaking in tongues? Is this still happening today?

## Output

> The Bible describes speaking in tongues (glossolalia) as a supernatural gift of the Holy Spirit used for prayer and the edification of the church.
>
> ### Biblical Foundation
>
> The New Testament identifies two primary forms of this gift:
>
> - **Known Languages:** In Acts 2, the apostles spoke in existing earthly languages they had never learned, allowing foreign visitors to hear the gospel in their own native tongues.
> - **Prayer Language:** In 1 Corinthians 14, Paul describes a private or ecstatic utterance used for personal edification or, when an interpreter is present, for the public encouragement of the church.
>
> ### Regulations for Use
>
> In 1 Corinthians 14, the Apostle Paul provides specific instructions to ensure order:
>
> - No more than two or three people should speak in a service.
> - It must be done one at a time.
> - If there is no interpreter, the speaker should remain silent in the church and speak only to themselves and God.
>
> ### Is it happening today?
>
> Within the Christian tradition, there are two primary views regarding whether this gift continues:
>
> - **Continuationism:** This view holds that all spiritual gifts, including tongues, remain active and available to the church today as a means of empowerment and grace.
> - **Cessationism:** This view argues that "sign gifts" like tongues and prophecy were intended only for the apostolic age to authenticate the early message of the Gospel and ceased once the New Testament was completed.
>
> Scripture encourages believers to "earnestly desire the spiritual gifts" while maintaining that love is the more excellent way (1 Corinthians 12:31–13:1).
>
> Would you like to explore the specific arguments for either continuationism or cessationism?

## Reason

> The model failed to take a clear position on whether the gift continues today, instead providing a comparison of views, which violates the requirement to avoid hiding behind 'denominations differ' (Anti-example 1). Additionally, while it correctly identified the Acts 2 definition, the structure included unrequested subheadings for what should have been a substantive faith answer.

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
