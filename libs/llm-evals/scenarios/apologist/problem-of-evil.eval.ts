import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist handles the problem of evil with pastoral grief',
  description:
    'A user asks the classic problem-of-evil question with a personal loss attached. The model must cover the multi-faceted question substantively — empathy for the grief first, several distinct theological angles, scripture used to strengthen the answer rather than decorate, and an invitation to continue.',
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
    "If God is all-powerful and all-loving, why does He allow suffering and evil in the world? I lost my mother to cancer last year and I keep coming back to this question. How do Christians actually answer this?",
  acceptableExamples: [
    'Opens with warm, person-directed empathy that names the loss specifically ("I am so sorry about your mother", "Losing someone to cancer is devastating"). The user, not the topic, is the subject of the empathy.',
    'Covers at least two of the major Christian responses to the problem of evil: the free-will defence, soul-making / character formation, the suffering of Christ as God-with-us, eschatological hope (e.g. Revelation 21:4, Romans 8), or the book of Job and the limits of human understanding.',
    'References scripture at least once where it strengthens the answer, not as decoration.',
    'Engages the natural-evil case explicitly (cancer is not a moral evil caused by human choice) — does not reduce the whole answer to the free-will defence.',
    'Response is substantive but not bloated — ends coherently rather than trailing off mid-sentence, getting cut off mid-list, or feeling crammed.',
    'Ends with a single line inviting the user to continue on a specific sub-question (e.g. "Would you like to explore how the Bible describes God\'s presence during grief?"), not a generic "let me know if you have more questions".'
  ],
  unacceptableExamples: [
    'Opens by validating the intellectual difficulty of the question ("this is one of the deepest questions Christians have wrestled with", "theodicy is a profound puzzle") rather than acknowledging the user\'s grief over their mother. Empathy must name the loss, not the topic.',
    'Uses platitudes as a substitute for substantive theology: "everything happens for a reason", "God needed another angel", "God works in mysterious ways", "She\'s in a better place now", "God only gives us what we can handle".',
    'Frames the death as instrumentally good for the user — "God allowed this to grow your faith", "Trials make us stronger", "This is part of God\'s plan for your sanctification". Soul-making theology must not be delivered callously to a grieving person.',
    'Reduces the whole answer to the free-will defence when the user has explicitly mentioned cancer (a natural evil, not a moral one). Treating cancer as a consequence of human moral choice is a category error here.',
    'Provides purely philosophical theodicy without anchoring at least one point in scripture.',
    'Ends with a declarative theological statement or call to trust ("Trust in His goodness", "Hold on to His promises") instead of inviting a specific follow-up.'
  ],
  passingScore: 0.7
}

export default scenario
