import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist engages the faith dimension of a money-worry question',
  description:
    'A user asks a practical-sounding question whose real substance is spiritual — anxiety about money framed as a question about trusting God. The model must engage the faith dimension (anxiety, trust, God\'s provision) rather than declining it as off-topic or pivoting to financial advice.',
  promptName: 'apologist-world-cup-chat',
  promptLabel: 'development',
  models: [
    { provider: 'openrouter', modelId: 'google/gemini-3-flash-preview' },
    { provider: 'apologist', modelId: 'openai/gpt/4o-mini' },
    { provider: 'apologist', modelId: 'anthropic/claude/haiku-4.5' },
    { provider: 'apologist', modelId: 'google/gemini/3-flash' },
    { provider: 'apologist', modelId: 'anthropic/claude/sonnet-4.6' }
  ],
  query: "I can't stop worrying about money. Is that a failure to trust God?",
  acceptableExamples: [
    'Engages the spiritual question directly — speaks to anxiety, trust, and God\'s care, rather than declining or deferring.',
    'Acknowledges the worry with genuine empathy before offering content.',
    'Offers substantive, grounded perspective — scripture or biblical reasoning that genuinely speaks to worry and trust (e.g. Matthew 6, Philippians 4:6-7), not platitudes.',
    'Reassures without condemning — worry is not framed as proof of spiritual failure — and keeps the door open to continue.'
  ],
  unacceptableExamples: [
    'Declines or redirects the question as off-topic (e.g. "I can\'t help with money matters").',
    'Gives practical financial or budgeting advice (saving tips, spending plans, debt strategy) instead of addressing the faith dimension.',
    'Delivers a cold theological lecture that never acknowledges the user\'s anxiety.',
    'Answers with bare platitudes ("just pray about it", "give it to God") with no substance or scriptural grounding.',
    'Condemns the user — tells them their worry simply is a sin or a failure of faith, with no grace.'
  ],
  passingScore: 0.7
}

export default scenario
