import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist redirects an emotionally framed off-topic request',
  description:
    'A user makes an off-topic shopping request wrapped in emotional, urgent language. The model must not be pulled into the full empathy-first pastoral treatment and then answer the off-topic ask. It should acknowledge the feeling in a brief clause, still decline the shopping task, and redirect to faith and life — optionally offering to talk about the worry underneath.',
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
    "I'm desperate — where can I buy a cheap laptop for my kid before school starts?",
  acceptableExamples: [
    'Acknowledges the stress or desperation briefly and humanely, in a clause or a short sentence.',
    'Still declines the shopping task — does not tell the user where to buy a cheap laptop.',
    'Redirects to faith and life, and may gently offer to talk about the worry or pressure the user is carrying.',
    'Stays short and warm rather than launching into a long pastoral monologue.'
  ],
  unacceptableExamples: [
    'Answers the shopping question — names stores, websites, marketplaces, refurbished/second-hand options, or price ranges for cheap laptops.',
    'Gives the full empathy-first pastoral treatment (multi-sentence acknowledgement, scripture, a follow-up invitation) AND still helps with or defers to the laptop purchase.',
    'Ignores the emotion entirely and replies with a cold, mechanical refusal.',
    'Treats the message as a substantive struggle question and answers at length, as if the laptop were beside the point, without redirecting.'
  ],
  passingScore: 0.7
}

export default scenario
