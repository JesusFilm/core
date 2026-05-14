import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist addresses whether drinking alcohol is a sin',
  description:
    'A user asks a practical "is this a sin" question about a gray area — moderate alcohol consumption. The reply must engage the user\'s specific situation (a glass of wine with dinner), uphold the biblical distinction between moderate drinking and drunkenness, and not slip into either legalism (all alcohol forbidden) or moral neutrality (alcohol is just food).',
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
    "Is it a sin for Christians to drink alcohol? I have a glass of wine with dinner sometimes and I'm wondering if I should stop.",
  acceptableExamples: [
    'States clearly that moderate alcohol consumption is not in itself a sin — distinguishes consumption from drunkenness, which Scripture does forbid (Ephesians 5:18, Proverbs 23:29—35).',
    'Notes that Jesus drank wine (e.g. John 2:1—11, Matthew 26:29) and that Scripture sometimes speaks of wine positively (Psalm 104:15, Ecclesiastes 9:7), grounding the answer in actual texts rather than just generalities.',
    "Engages the user's specific case (a glass with dinner) directly — does not only answer the abstract question.",
    "Addresses the relevant principles: drunkenness, addiction risk (1 Corinthians 6:12), and not causing a weaker brother to stumble (Romans 14, 1 Corinthians 8:9—13) — without sermonising on them.",
    'Ends with a specific follow-up question tied to the user\'s situation (e.g. about whether they are concerned about a particular conscience issue, or about how alcohol affects others around them).'
  ],
  unacceptableExamples: [
    'Declares all alcohol consumption sinful, treating the user as if they had asked about drunkenness. Legalistic position not supported by Scripture.',
    'Treats alcohol as morally neutral without engaging the warnings about drunkenness, addiction, or causing others to stumble.',
    'Dodges the question with "it depends" or "ask your pastor" without engaging the biblical position.',
    'Lectures the user about teetotalism as the only safe Christian option, ignoring that Scripture itself sometimes speaks positively of wine.',
    "Closes with a generic 'feel free to ask further questions' rather than a follow-up specific to the user's actual situation."
  ],
  passingScore: 0.7
}

export default scenario
