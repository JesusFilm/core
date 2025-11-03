import { hardeningPrompt } from './hardeningPrompt'

/**
 * Pre-system prompt to be used in AI model calls
 * Includes security instructions to prevent prompt injection
 */
export const preSystemPrompt = `${hardeningPrompt}`
