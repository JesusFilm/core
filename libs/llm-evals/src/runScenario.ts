import { generateText } from 'ai'

import { fetchSystemPrompt } from './langfuse'
import { resolveEvalModel } from './providers'
import type { Scenario } from './types'

export interface RunScenarioResult {
  systemPrompt: string
  output: string
  provider: string
  modelId: string
}

export async function runScenario(
  scenario: Scenario
): Promise<RunScenarioResult> {
  const systemPrompt = await fetchSystemPrompt({
    name: scenario.promptName,
    label: scenario.promptLabel,
    variables: scenario.promptVariables
  })

  const { model, provider, modelId } = resolveEvalModel()

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: scenario.query
  })

  return { systemPrompt, output: text, provider, modelId }
}
