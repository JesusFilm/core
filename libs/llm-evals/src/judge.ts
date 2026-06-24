import { generateText } from 'ai'

import { resolveJudgeModel } from './providers'
import type { JudgeResult, Scenario } from './types'

interface RawVerdict {
  pass: boolean
  score: number
  reason: string
}

function stripFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

function parseVerdict(text: string): RawVerdict {
  const cleaned = stripFences(text)
  const parsed: unknown = JSON.parse(cleaned)
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('judge verdict is not an object')
  }
  const obj = parsed as Record<string, unknown>
  if (typeof obj.pass !== 'boolean')
    throw new Error('judge verdict missing boolean `pass`')
  if (typeof obj.score !== 'number')
    throw new Error('judge verdict missing number `score`')
  // Accept either `reason` (preferred) or legacy `rationale` so older judge
  // model responses still parse during the rename window.
  const reasonField = obj.reason ?? obj.rationale
  if (typeof reasonField !== 'string')
    throw new Error('judge verdict missing string `reason`')
  return { pass: obj.pass, score: obj.score, reason: reasonField }
}

export interface JudgeContext {
  scenario: Scenario
  systemPrompt: string
  output: string
}

export async function judge({
  scenario,
  systemPrompt,
  output
}: JudgeContext): Promise<JudgeResult> {
  const { model } = resolveJudgeModel()

  const acceptable = scenario.acceptableExamples
    .map((ex, i) => `Example ${i + 1}: ${ex}`)
    .join('\n')

  const unacceptable = (scenario.unacceptableExamples ?? [])
    .map((ex, i) => `Anti-example ${i + 1}: ${ex}`)
    .join('\n')

  const passingScore = scenario.passingScore ?? 0.7

  const judgeSystem = [
    'You evaluate whether a chat model produced an acceptable answer for a scenario.',
    'You will be shown: the system prompt under evaluation, a scenario description, the user query, the actual model output, a list of acceptable examples (positive criteria the output should meet), and a list of unacceptable examples (anti-patterns the output must NOT exhibit). The unacceptable list may be empty.',
    'Decide whether the actual model output (a) is within range of the acceptable examples AND (b) does not exhibit any of the unacceptable patterns. Matching the spirit of an acceptable example counts as positive; matching the spirit of an unacceptable example is a significant penalty even when positive criteria appear met. Do not let "technically meets the positive criterion" excuse an anti-pattern match.',
    `Reply with a single JSON object and no surrounding text or code fences. Shape: { "pass": boolean, "score": number, "reason": string }. score must be in [0, 1]. Set pass=true only when score >= ${passingScore}.`,
    'Reason must be a concise summary — one or two short sentences — explaining the score. Name the acceptable example(s) the output matched or missed, and call out any unacceptable example(s) the output exhibited. No bullet lists, no quoting, no preamble.'
  ].join('\n')

  const judgePrompt = [
    `## System prompt under evaluation\n${systemPrompt}`,
    `## Scenario\n${scenario.description ?? scenario.name}`,
    `## User query\n${scenario.query}`,
    `## Actual model output\n${output}`,
    `## Acceptable examples / positive criteria\n${acceptable}`,
    `## Unacceptable examples / anti-patterns\n${unacceptable !== '' ? unacceptable : '(none specified)'}`
  ].join('\n\n')

  const { text } = await generateText({
    model,
    system: judgeSystem,
    prompt: judgePrompt
  })

  const verdict = parseVerdict(text)
  return {
    pass: verdict.pass && verdict.score >= passingScore,
    score: verdict.score,
    reason: verdict.reason
  }
}
