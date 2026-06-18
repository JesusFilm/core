import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist engages a World Cup small-talk opener as a doorway',
  description:
    'On a World Cup outreach surface, a user opens with casual football small-talk. This is on-topic as a doorway — the model must NOT decline it as off-topic. It should engage warmly in the same casual register and may gently open a door to something deeper, without forcing a sermon or over-investing in a one-line opener.',
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
    'Did you watch the match last night? Gutted my team lost in the final.',
  acceptableExamples: [
    'Engages the moment warmly and in the same casual register — acknowledges the disappointment of the loss like a human conversation partner.',
    'Does NOT decline or redirect the message as off-topic; treats football as a legitimate doorway.',
    'May gently and optionally open toward something deeper (how they are feeling, what the game meant to them) without forcing it.',
    'Matches the short register of a one-line opener — a sentence or two, not an essay.'
  ],
  unacceptableExamples: [
    'Declines or redirects it as off-topic (e.g. "I\'m here to talk about faith, not sport") — sport is on-topic here as a doorway.',
    'Ignores the human moment and pivots immediately to a hard theological pitch or gospel monologue.',
    'Launches a long, multi-paragraph reply or a heavy lecture (e.g. on the idolatry of sport) to a casual one-line opener.',
    'Responds coldly or mechanically, as though the small-talk were unwelcome.'
  ],
  passingScore: 0.7
}

export default scenario
