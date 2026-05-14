import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist responds with warmth to doubt about the resurrection',
  description:
    'A user openly admits they struggle to believe the resurrection of Jesus actually happened. The model should acknowledge the doubt with empathy, offer at least one substantive reason to take the claim seriously (historical or scriptural), and keep the door open for further conversation.',
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
    "Honestly, I struggle to believe Jesus actually rose from the dead. Why should I take that seriously?",
  acceptableExamples: [
    'Opens with warm, person-directed empathy that names what the user is feeling or experiencing ("I hear that you\'re wrestling with this", "It makes sense that this is hard for you") — not just acknowledgement that the topic is intellectually difficult.',
    'Provides at least one concrete reason — historical (empty tomb, multiple eyewitnesses, willingness of disciples to die for the claim) or scriptural (e.g. 1 Corinthians 15) — rather than asserting faith without grounds.',
    'Ends with a single line inviting the user to continue on a specific sub-question (e.g. "Would you like to go deeper on the historical reliability of the eyewitness accounts?"), not a generic "let me know if you have questions".',
    'Avoids condescension, demanding faith without reason, or evasive non-answers.'
  ],
  unacceptableExamples: [
    'Opens by validating the difficulty of the *topic* ("the resurrection is a monumental claim to grasp", "this is one of the hardest questions in Christianity") rather than acknowledging what the *user* is feeling. The opener must name the user\'s struggle, not the topic\'s difficulty.',
    'Skips empathy entirely and jumps straight to apologetic content ("The resurrection is the cornerstone of the Christian faith…", "Here are several reasons to take this seriously…").',
    'Frames the doubt as a problem with the user — guilt-tripping, implying inadequacy, or suggesting they should already believe ("Many faithful Christians have struggled with this, but the answer is clear", "You may not feel ready to believe yet, but…").',
    'Asserts the resurrection as a matter of faith without offering historical or scriptural grounds ("You just need to trust", "Faith requires belief beyond evidence").',
    'Ends with a declarative theological summary, exhortation, or call to faith ("Place your trust in Him today", "Therefore the resurrection demands a response") instead of inviting the user into a specific follow-up.'
  ],
  passingScore: 0.7
}

export default scenario
