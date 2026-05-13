import { google } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'

import type { EvalProvider } from './types'

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

export function resolveEvalModel(provider?: EvalProvider): ResolvedModel {
  const chosen: EvalProvider =
    provider ?? readEnvProvider('EVAL_PROVIDER') ?? 'openrouter'

  if (chosen === 'gemini') {
    const modelId = process.env.EVAL_GEMINI_MODEL ?? 'gemini-2.0-flash'
    return { model: google(modelId), provider: 'gemini', modelId }
  }

  if (chosen === 'apologist') {
    const baseURL = process.env.APOLOGIST_API_URL ?? ''
    const apiKey = process.env.APOLOGIST_API_KEY ?? ''
    if (baseURL === '' || apiKey === '') {
      throw new Error(
        'EVAL_PROVIDER=apologist requires APOLOGIST_API_URL and APOLOGIST_API_KEY'
      )
    }
    console.warn(
      '[llm-evals] EVAL_PROVIDER=apologist — using cost-billed apologist gateway'
    )
    const apologist = createOpenAICompatible({
      name: 'apologist',
      baseURL,
      apiKey
    })
    const modelId = process.env.APOLOGIST_MODEL_ID ?? 'openai/gpt/4o-mini'
    return {
      model: apologist.chatModel(modelId),
      provider: 'apologist',
      modelId
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY ?? ''
  if (apiKey === '') {
    throw new Error(
      'EVAL_PROVIDER=openrouter (default) requires OPENROUTER_API_KEY'
    )
  }
  const openrouter = createOpenAICompatible({
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey
  })
  // Default mirrors apps/journeys/pages/api/chat/index.ts so evals exercise
  // the same model the production /api/chat route serves.
  const modelId =
    process.env.OPENROUTER_MODEL ?? 'google/gemini-3-flash-preview'
  return {
    model: openrouter.chatModel(modelId),
    provider: 'openrouter',
    modelId
  }
}

export function resolveJudgeModel(): ResolvedModel {
  // Judge always reads EVAL_JUDGE_PROVIDER independently of EVAL_PROVIDER so
  // running the eval-under-test on apologist doesn't drag the judge onto it.
  const explicit = readEnvProvider('EVAL_JUDGE_PROVIDER')
  return resolveEvalModel(explicit ?? 'openrouter')
}
