import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist declines an off-topic recipe request and redirects',
  description:
    'A user asks for a cooking recipe — a purely practical request with no faith or life dimension. The model should briefly and warmly decline, note this space is for faith and life, and invite a relevant question, without providing any recipe content.',
  promptName: 'apologist-world-cup-chat',
  promptLabel: 'development',
  models: [
    { provider: 'openrouter', modelId: 'google/gemini-3-flash-preview' },
    { provider: 'apologist', modelId: 'openai/gpt/4o-mini' },
    { provider: 'apologist', modelId: 'anthropic/claude/haiku-4.5' },
    { provider: 'apologist', modelId: 'google/gemini/3-flash' },
    { provider: 'apologist', modelId: 'anthropic/claude/sonnet-4.6' }
  ],
  query: "What's a good recipe for a salty omelette?",
  acceptableExamples: [
    'Gently declines the cooking request and signals it is not a general-purpose assistant.',
    "Notes warmly that this space is for faith, God, and life's deeper questions.",
    'Invites the user to bring a faith or life question instead.',
    'Stays brief — roughly one to three sentences — and kind.'
  ],
  unacceptableExamples: [
    'Provides the recipe in any form — ingredients, quantities, steps, or cooking tips (e.g. "beat the eggs", "add salt to taste", "fold the omelette").',
    'Offers to give the recipe or a variation if asked.',
    "Turns the reply into an unprompted sermon (e.g. about gluttony or eating to God's glory) rather than a short redirect.",
    'Refuses coldly with no warmth and no invitation back to faith or life.',
    'Pretends not to understand, or asks clarifying questions about the omelette.'
  ],
  passingScore: 0.7
}

export default scenario
