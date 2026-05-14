import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist explains the gift of speaking in tongues',
  description:
    "A user asks a doctrinally contested question about the gift of tongues — whether it's biblical, what it is, and whether it's still happening today. The reply must engage the actual biblical text (tongues as real languages in Acts 2, Paul's instructions in 1 Corinthians 14), present a clear position on cessation, and avoid hiding behind 'denominations differ' rather than answering.",
  promptName: 'apologist-world-cup-chat',
  promptLabel: 'development',
  models: [
    { provider: 'openrouter', modelId: 'google/gemini-3-flash-preview' },
    { provider: 'apologist', modelId: 'openai/gpt/4o-mini' },
    { provider: 'apologist', modelId: 'anthropic/claude/haiku-4.5' },
    { provider: 'apologist', modelId: 'google/gemini/3-flash' },
    { provider: 'apologist', modelId: 'anthropic/claude/sonnet-4.6' }
  ],
  query:
    'What does the Bible say about speaking in tongues? Is this still happening today?',
  acceptableExamples: [
    'Defines tongues as real, intelligible human languages used to communicate the gospel — references Acts 2 where hearers heard their own languages.',
    "Engages Paul's instructions on the use of tongues in the church (1 Corinthians 12—14): tongues require interpretation in public, edify the hearer, and must be exercised in order.",
    "Takes a clear position on whether the gift continues today (cessationist or continuationist) rather than dodging the question — and grounds the position in Scripture, while acknowledging the Spirit's sovereignty in distributing gifts (1 Corinthians 12:11).",
    'Cites scripture references that genuinely strengthen the points (e.g. Acts 2:6, 1 Corinthians 14:27—28) — not verse-padding.',
    'Stops at the answer rather than adding unrequested sub-topics or pastoral exhortation.'
  ],
  unacceptableExamples: [
    "Refuses to take a position by hiding behind 'denominations disagree' or 'this is a personal conviction'.",
    'Treats tongues as ecstatic, unintelligible utterance without engaging the Acts 2 definition as real languages.',
    'Misrepresents 1 Corinthians 14 by either prohibiting all modern tongues unconditionally without citing the text, or endorsing uninterpreted tongues in public against the explicit instruction.',
    "Pads with verses to satisfy a quota, citing Scripture that doesn't strengthen the specific point being made.",
    "Closes with a generic 'feel free to ask more' rather than a specific sub-question tied to the topic."
  ],
  passingScore: 0.7
}

export default scenario
