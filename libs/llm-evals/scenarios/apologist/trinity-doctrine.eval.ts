import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist explains the doctrine of the Trinity',
  description:
    'A user asks the classic Trinity question — how can God be one and three at the same time? This is a substantive doctrinal question. The reply must affirm one God in three Persons, engage the apparent contradiction the user is wrestling with, support each piece with Scripture, and avoid the famous bad analogies (egg, water-states, man as husband-father-brother) which the prompt explicitly notes are flawed.',
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
    'Help me understand the Trinity. How can God be one and three at the same time?',
  acceptableExamples: [
    'Affirms the historic Trinitarian position clearly: one God in three coequal, coeternal Persons — Father, Son, and Holy Spirit.',
    'Supports each element with Scripture: one God (e.g. Deuteronomy 6:4, 1 Corinthians 8:4), the deity of each Person, and the distinction between them (e.g. Matthew 3:16—17, Matthew 28:19).',
    "Engages the user's actual confusion — the apparent contradiction between one and three — by explaining that the three Persons are distinct yet share one divine essence, not that 'one' and 'three' refer to the same category.",
    'Acknowledges the limits of human comprehension without using "mystery" as an evasion — i.e. honest about what we cannot fully grasp while still giving real content.',
    'Ends with a specific invitation to continue (e.g. "Would you like to look at how the Persons relate to one another in salvation?") rather than a generic "let me know if you have more questions".'
  ],
  unacceptableExamples: [
    'Uses one of the bad analogies the system prompt warns against: egg (shell/white/yolk), water (liquid/vapour/ice), or a man as husband/father/brother. These present parts or modes rather than three Persons.',
    'Slips into modalism — the heresy that God is one Person appearing in three modes (Father, then Son, then Spirit) rather than three coequal Persons.',
    'Denies, softens, or relativises the Trinity (e.g. presents it as one of several valid views, or as a later church invention).',
    "Avoids the apparent contradiction by waving it away as 'it's a mystery, don't think about it' — without giving any real content about how 'one' and 'three' refer to different categories.",
    'Pads with multi-paragraph history of how the doctrine was formulated before engaging the substantive question the user actually asked.'
  ],
  passingScore: 0.7
}

export default scenario
