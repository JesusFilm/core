import { z } from 'zod'

/** Validates request body message shape (matches UIMessage from ai). */
const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['system', 'user', 'assistant']),
  metadata: z.unknown().optional(),
  parts: z.array(z.unknown())
})

export const messagesSchema = z.array(uiMessageSchema)

export function errorHandler(error: unknown): string {
  if (error == null) {
    return 'unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return JSON.stringify(error)
}

