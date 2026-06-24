export type EvalProvider = 'openrouter' | 'gemini' | 'apologist'

export interface ScenarioModel {
  provider: EvalProvider
  modelId: string
}

export interface Scenario {
  name: string
  description?: string
  promptName: string
  promptLabel: string
  promptVariables?: Record<string, string>
  query: string
  models: [ScenarioModel, ...ScenarioModel[]]
  acceptableExamples: string[]
  unacceptableExamples?: string[]
  passingScore?: number
}

export interface JudgeResult {
  pass: boolean
  score: number
  reason: string
}
