import { google } from '@ai-sdk/google'

const DEFAULT_MODEL = 'gemini-2.0-flash'
const DEFAULT_MAX_RETRIES = 4

export function getGeminiModel() {
  return google(process.env.GEMINI_MODEL ?? DEFAULT_MODEL)
}

export function getGeminiMaxRetries(): number {
  const envValue = process.env.GEMINI_MAX_RETRIES
  if (envValue == null || envValue === '') return DEFAULT_MAX_RETRIES
  const parsed = Number(envValue)
  return Number.isNaN(parsed) ? DEFAULT_MAX_RETRIES : parsed
}
