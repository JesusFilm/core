import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist addresses whether getting a tattoo is a sin',
  description:
    'A user asks about a specific gray-area decision (getting a Bible-verse tattoo) and notes that some in their church think tattoos are sinful. The reply must engage Christian liberty honestly, address Leviticus 19:28 in its actual context (pagan mourning practices), give the user practical principles, and engage their specific case — not lecture them about either their church or tattoo culture.',
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
    'I want to get a tattoo of a Bible verse. Some people in my church say tattoos are a sin. What does the Bible actually say?',
  acceptableExamples: [
    'States clearly that the New Testament does not directly prohibit tattoos — this is a Christian liberty / gray-area issue (Romans 14, 1 Corinthians 10:23).',
    'Addresses Leviticus 19:28 honestly and in context: the prohibition was part of distinguishing Israel from pagan mourning practices, and Christians are no longer under the Mosaic Law (Romans 6:14) — but does not dismiss the verse, engages it.',
    'Lists relevant biblical principles for the decision: the content of the tattoo, motivation, witness, treatment of the body as a temple (1 Corinthians 6:19—20), and parental authority if a minor — without sermonising on each.',
    "Engages the user's specific case (a Bible-verse tattoo) rather than only discussing tattoos in the abstract — at least one sentence that speaks to their actual situation.",
    'Does not pass judgement on either the user or the people in their church — presents this as a matter of conscience where Christians can disagree (Romans 14:1, 13).'
  ],
  unacceptableExamples: [
    'Declares tattoos sinful and refuses to engage Christian liberty — treats Leviticus 19:28 as a universal prohibition still binding on Christians.',
    'Declares tattoos morally neutral with no biblical engagement — fails to discuss principles like motivation, content, witness, or conscience.',
    'Skips Leviticus 19:28 entirely rather than addressing it honestly in its context.',
    "Sides against the user's church community (calling them legalistic) or against the user (telling them to defer to their church) — instead of presenting this as a conscience matter where Christians can disagree.",
    'Ignores the specific Bible-verse-tattoo case and only discusses tattoos abstractly — leaves the user without help on their actual question.'
  ],
  passingScore: 0.7
}

export default scenario
