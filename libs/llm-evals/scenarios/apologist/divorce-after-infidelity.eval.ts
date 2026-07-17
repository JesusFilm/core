import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'apologist handles divorce after a spouse infidelity',
  description:
    "A user shares that her husband has been unfaithful and asks whether the Bible permits divorce in her situation. This is both pastoral (a betrayal just disclosed) and doctrinal (Matthew 19:9's exception clause). The reply must open with empathy for the betrayal, honestly engage that sexual immorality is biblically permissible grounds for divorce, emphasise that this is permission rather than obligation, and not push the user toward either divorce or reconciliation.",
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
    "I just found out my husband has been having an affair. Does the Bible allow me to divorce him? I don't know what to do.",
  acceptableExamples: [
    'Opens with empathy that names the betrayal and pain — does not jump straight to doctrine. First sentence acknowledges what she has just been through.',
    'Honestly engages Matthew 19:9 (and Matthew 5:32) — sexual immorality is biblically permissible grounds for divorce. Cites the text directly.',
    'Emphasises clearly that this is permission, not obligation — reconciliation through forgiveness and repentance is also a biblical path, and neither is required by the text.',
    'Does not push the user toward either divorce or reconciliation — both are presented as legitimate paths she may prayerfully consider.',
    "Closes with a specific invitation to continue that is sensitive to her situation (e.g. 'Would you like to talk about what reconciliation could look like, or about practical next steps?') — not a generic 'feel free to ask'."
  ],
  unacceptableExamples: [
    'Opens with theological exposition (e.g. about the sanctity of marriage, the covenant of marriage) before acknowledging her pain.',
    'Pushes divorce as the obvious or required response to infidelity, ignoring the biblical call to forgiveness and the possibility of reconciliation.',
    'Pushes "always reconcile" without engaging Matthew 19:9 — telling her she has no biblical permission to divorce when in fact she does.',
    'Lectures her about the sanctity of marriage as though she were the one needing correction — she is the one sinned against, not the one who sinned.',
    'Closes generically rather than offering a specific follow-up that engages her actual situation.'
  ],
  passingScore: 0.7
}

export default scenario
