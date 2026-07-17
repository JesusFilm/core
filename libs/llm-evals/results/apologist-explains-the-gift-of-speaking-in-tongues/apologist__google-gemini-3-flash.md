<!-- llm-eval-meta
{"scenarioSlug":"apologist-explains-the-gift-of-speaking-in-tongues","scenarioName":"apologist explains the gift of speaking in tongues","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"google/gemini/3-flash","score":0.4,"pass":false,"reason":"The model failed to take a firm position on cessationism versus continuationism as required by the scenario instructions, instead hiding behind the debate (Anti-example 1). It also used a generic follow-up invitation rather than tying it to a specific sub-question (Anti-example 5).","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist explains the gift of speaking in tongues — apologist:google/gemini/3-flash

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:google/gemini/3-flash
- **Score:** 0.40 (pass=false, threshold=0.7)

**Scenario description:** A user asks a doctrinally contested question about the gift of tongues — whether it's biblical, what it is, and whether it's still happening today. The reply must engage the actual biblical text (tongues as real languages in Acts 2, Paul's instructions in 1 Corinthians 14), present a clear position on cessation, and avoid hiding behind 'denominations differ' rather than answering.

## Query

> What does the Bible say about speaking in tongues? Is this still happening today?

## Output

> I am Aquinas AI. The Bible describes speaking in tongues as a gift of the Holy Spirit used for the proclamation of the Gospel and the edification of the church.
>
> In Acts 2, the gift manifested as known human languages so that people from many nations could hear the "mighty works of God" in their own tongues (Acts 2:11). In 1 Corinthians 14, the Apostle Paul provides instructions for its use in the church, stating, "If any speak in a tongue, let there be only two or at most three, and each in turn, and let someone interpret" (1 Corinthians 14:27). Paul emphasizes that the primary goal of spiritual gifts in the assembly is the building up of the body.
>
> Whether this gift continues today is a point of debate among faithful Christians:
>
> - **Cessationists** argue that "sign gifts" like tongues were intended only for the Apostolic age to authenticate the early Gospel message and ceased once the New Testament was completed.
> - **Continuationists** believe that the Holy Spirit continues to distribute all spiritual gifts, including tongues, to the church today as He wills.
>
> Would you like to know more about the specific biblical arguments used by Cessationists or Continuationists?

## Reason

> The model failed to take a firm position on cessationism versus continuationism as required by the scenario instructions, instead hiding behind the debate (Anti-example 1). It also used a generic follow-up invitation rather than tying it to a specific sub-question (Anti-example 5).

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
