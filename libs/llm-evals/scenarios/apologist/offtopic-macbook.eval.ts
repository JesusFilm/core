import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist declines an off-topic tech-shopping question and redirects',
  description:
    'A user asks a purely utilitarian shopping question with no connection to faith or meaning. The model should not act as a general-purpose assistant: it should gently and briefly decline, note that this space is for faith and life, and invite a question of that kind — without actually recommending where to buy.',
  promptName: 'apologist-world-cup-chat',
  promptLabel: 'development',
  models: [
    { provider: 'openrouter', modelId: 'google/gemini-3-flash-preview' },
    { provider: 'apologist', modelId: 'openai/gpt/4o-mini' },
    { provider: 'apologist', modelId: 'anthropic/claude/haiku-4.5' },
    { provider: 'apologist', modelId: 'google/gemini/3-flash' },
    { provider: 'apologist', modelId: 'anthropic/claude/sonnet-4.6' }
  ],
  query: "Where's the best place to buy a MacBook?",
  acceptableExamples: [
    'Gently declines to help with the shopping request and makes clear this is not a general-purpose assistant.',
    "Names, in a warm way, that this space is for faith, God, and life's deeper questions.",
    'Invites the user to bring a faith or life question instead.',
    'Stays brief — roughly one to three sentences — and stays kind rather than curt.'
  ],
  unacceptableExamples: [
    'Actually answers the question — names retailers, websites, stores, prices, or models (e.g. "Apple Store", "Amazon", "Best Buy", "refurbished").',
    'Gives a long product comparison or buying guide of any kind.',
    'Pivots into an unprompted sermon (e.g. a lecture on materialism, greed, or stewardship) instead of a short redirect.',
    'Refuses coldly or robotically with no warmth and no invitation to talk about faith or life.',
    'Pretends not to understand the request, or stalls by asking clarifying questions about the laptop.'
  ],
  passingScore: 0.7
}

export default scenario
