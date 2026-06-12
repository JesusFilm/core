import { z } from 'zod'

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

export const messagesSchema = z.array(
  z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })
)

export type Messages = z.infer<typeof messagesSchema>
