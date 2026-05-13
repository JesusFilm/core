export type EvalProvider = 'openrouter' | 'gemini' | 'apologist'

export interface Scenario {
  name: string
  description?: string
  promptName: string
  promptLabel: string
  promptVariables?: Record<string, string>
  query: string
  acceptableExamples: string[]
  unacceptableExamples?: string[]
  passingScore?: number
}

export interface JudgeResult {
  pass: boolean
  score: number
  reason: string
}
