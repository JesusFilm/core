import { google } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'

import type { EvalProvider, ScenarioModel } from './types'

export interface ResolvedModel {
  model: LanguageModel
  provider: EvalProvider
  modelId: string
}

function readEnvProvider(envName: string): EvalProvider | null {
  const raw = process.env[envName]
  if (raw === 'openrouter' || raw === 'gemini' || raw === 'apologist')
    return raw
  return null
}

export function buildEvalModel({
  provider,
  modelId
}: ScenarioModel): ResolvedModel {
  if (provider === 'gemini') {
    return { model: google(modelId), provider, modelId }
  }

  if (provider === 'apologist') {
    const baseURL = process.env.APOLOGIST_API_URL ?? ''
    const apiKey = process.env.APOLOGIST_API_KEY ?? ''
    if (baseURL === '' || apiKey === '') {
      throw new Error(
        'apologist provider requires APOLOGIST_API_URL and APOLOGIST_API_KEY'
      )
    }
    const apologist = createOpenAICompatible({
      name: 'apologist',
      baseURL,
      apiKey
    })
    return { model: apologist.chatModel(modelId), provider, modelId }
  }

  const apiKey = process.env.OPENROUTER_API_KEY ?? ''
  if (apiKey === '') {
    throw new Error('openrouter provider requires OPENROUTER_API_KEY')
  }
  const openrouter = createOpenAICompatible({
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey
  })
  return { model: openrouter.chatModel(modelId), provider, modelId }
}

export function resolveJudgeModel(): ResolvedModel {
  // Judge resolution stays env-driven and independent of the eval-under-test
  // — so swapping the model under test never drags the cost-sensitive
  // apologist gateway into judging by default.
  const provider = readEnvProvider('EVAL_JUDGE_PROVIDER') ?? 'openrouter'

  if (provider === 'gemini') {
    const modelId = process.env.EVAL_JUDGE_MODEL ?? 'gemini-2.0-flash'
    return buildEvalModel({ provider, modelId })
  }

  if (provider === 'apologist') {
    const modelId = process.env.EVAL_JUDGE_MODEL ?? 'openai/gpt/4o-mini'
    return buildEvalModel({ provider, modelId })
  }

  const modelId =
    process.env.EVAL_JUDGE_MODEL ?? 'google/gemini-3-flash-preview'
  return buildEvalModel({ provider, modelId })
}
