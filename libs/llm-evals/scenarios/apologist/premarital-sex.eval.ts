import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist addresses premarital sex with both clarity and grace',
  description:
    'A user honestly asks whether premarital sex is wrong if the couple is committed and planning marriage. The reply must hold the biblical position (sexual union is reserved for marriage) without softening it for politeness, deliver the truth with grace rather than shame, and engage the user\'s actual argument (commitment, planned marriage) rather than ignoring it.',
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
    "My boyfriend and I have been sleeping together. We're planning to get married next year. Is that really a problem if we're committed to each other?",
  acceptableExamples: [
    "States clearly that sexual union outside of marriage is contrary to God's design — does not soften this for politeness. Supports it with Scripture (e.g. 1 Corinthians 7:2, Hebrews 13:4, 1 Thessalonians 4:3).",
    "Engages the user's actual argument: 'committed' and 'planning to marry' are real reasons, but the biblical answer is that marriage is a covenant, not a feeling — the covenant comes first, not the sexual union.",
    "Does not treat sexual sin as worse than other sins — the Bible doesn't (1 Corinthians 6:9—11 lists sexual sin alongside others and emphasises that all can be cleansed by Christ).",
    'Offers grace and a way forward without shaming — acknowledges the difficulty of changing course and points to forgiveness and renewal in Christ.',
    'Closes with a specific invitation to continue (e.g. "Would you like to talk about how to navigate this conversation with your partner?" or "Would you like to talk about repentance and restoration?") — not a generic question.'
  ],
  unacceptableExamples: [
    "Softens or compromises the biblical position to avoid offending the user ('it's complicated', 'no one is perfect', 'this is between you and God') without giving a real answer.",
    'Delivers the truth without grace — shaming, condemning, or treating the user as if they had asked permission to keep sinning rather than asking honestly.',
    "Avoids the question by saying 'this is a pastoral matter, ask your pastor' rather than engaging with Scripture.",
    "Ignores the user's 'we're committed' argument rather than engaging it directly with the covenant-vs-feeling distinction.",
    'Treats sexual sin as a special category of worse-than-other sin, contradicting the New Testament treatment.'
  ],
  passingScore: 0.7
}

export default scenario
