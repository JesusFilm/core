<!-- llm-eval-meta
{"scenarioSlug":"apologist-explains-the-gift-of-speaking-in-tongues","scenarioName":"apologist explains the gift of speaking in tongues","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"openrouter","modelId":"google/gemini-3.7-flash","score":0.4,"pass":false,"reason":"The model failed the negative criterion of refusing to take a position, instead hiding behind a neutral description of continuationism vs. cessationism. It also violated formatting rules by using Markdown headings for a relatively short response and failed to match the spirit of the 'take a clear position' instruction.","lastRun":"2026-10-06T02:57:17.092Z","generationAttempts":1,"judgeAttempts":1}
-->

# apologist explains the gift of speaking in tongues — openrouter:google/gemini-3.7-flash

_Last run: 2026-10-06T02:57:17.092Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** openrouter:google/gemini-3.7-flash
- **Score:** 0.40 (pass=false, threshold=0.7)
- **Generation attempts:** 1
- **Judge attempts:** 1

**Scenario description:** A user asks a doctrinally contested question about the gift of tongues — whether it's biblical, what it is, and whether it's still happening today. The reply must engage the actual biblical text (tongues as real languages in Acts 2, Paul's instructions in 1 Corinthians 14), present a clear position on cessation, and avoid hiding behind 'denominations differ' rather than answering.

## Query

> What does the Bible say about speaking in tongues? Is this still happening today?

## Output

> In the New Testament, speaking in tongues (*glossolalia*) refers to a supernatural gift of the Holy Spirit where a believer speaks in a language given by God.
>
> ### What the Bible Says About Tongues
>
> 1. **Known Human Languages at Pentecost**
>    In Acts 2:4–11, the Holy Spirit enabled the disciples to speak in existing foreign languages that they had never learned, allowing visitors from various nations to hear "the mighty works of God" in their own native tongues.
>
> 2. **A Spiritual Gift for Prayer and Edification**
>    In 1 Corinthians 12–14, Paul describes tongues as a spiritual gift distributed by the Spirit for the common good (1 Corinthians 12:7–11). It can serve as personal prayer to God (1 Corinthians 14:2) or as a message for the congregation when accompanied by the gift of interpretation (1 Corinthians 14:5, 13).
>
> 3. **Biblical Guidelines for Public Worship**
>    Paul placed clear boundaries on the use of tongues in church gatherings:
>    - Order must be maintained; no more than two or three should speak, each in turn (1 Corinthians 14:27).
>    - If there is no interpreter present, the speaker must remain silent in the church and speak to himself and God (1 Corinthians 14:28).
>    - Without love, tongues are merely "a noisy gong or a clanging cymbal" (1 Corinthians 13:1).
>
> ---
>
> ### Is It Still Happening Today?
>
> Christians hold two primary views on whether tongues continue today:
>
> - **Continuationism:** This view holds that all spiritual gifts, including tongues, remain active and available to the church today until Jesus returns. Continuationists point to 1 Corinthians 1:7 and argue that the "perfect" mentioned in 1 Corinthians 13:10 refers to the second coming of Christ.
> - **Cessationism:** This view holds that miraculous "sign gifts" (such as tongues and direct revelation) ceased with the death of the apostles and the completion of the New Testament scriptures. Cessationists believe these gifts were uniquely given to lay the foundation of the church and authenticate the apostolic message (Hebrews 2:3–4; Ephesians 2:20).
>
> Would you like to explore the scriptural arguments for either the continuationist or cessationist view in more detail?

## Reason

> The model failed the negative criterion of refusing to take a position, instead hiding behind a neutral description of continuationism vs. cessationism. It also violated formatting rules by using Markdown headings for a relatively short response and failed to match the spirit of the 'take a clear position' instruction.

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
