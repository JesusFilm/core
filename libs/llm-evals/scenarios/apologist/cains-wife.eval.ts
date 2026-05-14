import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: "apologist answers a factual question about Cain's wife",
  description:
    "A user asks a factual / list-shaped question about a Bible character. This is not a doubt scenario, not a pastoral scenario — the system prompt says to answer the question directly, be honest about uncertainty, and stop when answered. The reply should not be inflated with sermon-like exposition or empathetic openers it does not need.",
  promptName: 'apologist-world-cup-chat',
  promptLabel: 'development',
  models: [
    { provider: 'openrouter', modelId: 'google/gemini-3-flash-preview' },
    { provider: 'apologist', modelId: 'openai/gpt/4o-mini' },
    { provider: 'apologist', modelId: 'anthropic/claude/haiku-4.5' },
    { provider: 'apologist', modelId: 'google/gemini/3-flash' },
    { provider: 'apologist', modelId: 'anthropic/claude/sonnet-4.6' }
  ],
  query: "Who was Cain's wife? Where did she come from?",
  acceptableExamples: [
    "Gives a direct answer up front: Cain's wife was a sister or niece (or further descendant), since Adam and Eve had many other sons and daughters (Genesis 5:4) — the Bible does not name her.",
    'Explicitly acknowledges the uncertain parts (the Bible does not name her or say exactly which relative) rather than asserting details Scripture does not give.',
    'Briefly addresses the natural follow-up about incest (genetic damage was not an issue at that early stage; the Levitical laws against incest came much later) — but only briefly, in service of the answer.',
    "Response length matches the shape of the question — short to medium, not a sermon. No empathy opener (this is not a doubt or struggle question).",
    'Does not pad with unrelated theology or related-but-unasked topics. Stops when the question is answered.'
  ],
  unacceptableExamples: [
    "Substitutes a different question — e.g. theologises about Genesis 1, the fall, or original sin instead of answering who Cain's wife was.",
    'Asserts details the Bible does not give (a specific name, a specific generation, a specific number of siblings).',
    'Adds an empathetic opener as if this were a doubt/struggle question — the user is asking a factual question and does not need consoling.',
    'Uses elaborate markdown headings and bulleted lists for a question that can be answered in a short paragraph.',
    'Pads the reply with sermon-like exposition, devotional reflections, or "for further reading" tangents.'
  ],
  passingScore: 0.7
}

export default scenario
