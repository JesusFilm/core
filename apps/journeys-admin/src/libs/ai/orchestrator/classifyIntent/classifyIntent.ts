import { google } from '@ai-sdk/google'
import { NoObjectGeneratedError, generateObject } from 'ai'
import { z } from 'zod'

import { langfuse, langfuseEnvironment } from '../../langfuse/server'

const classificationSchema = z.object({
  intentType: z
    .enum(['general', 'simple_crud', 'plan_journey', 'error'])
    .describe('The type of intent that the user is trying to perform.'),
  requiresTools: z.boolean().describe('Whether the intent requires tools.'),
  toolCategories: z
    .array(z.enum(['simple_crud', 'plan']))
    .describe(
      'The categories of tools that are required to complete the intent.'
    ),
  promptModules: z
    .array(z.enum(['tool-usage-rules', 'plan-journey', 'layout-journey']))
    .describe('The prompt modules that are required to complete the intent.'),
  reasoning: z.string().describe('A brief explanation for the classification.')
})

export type IntentClassification = z.infer<typeof classificationSchema>

/**
 * Classifies the user's intent based on recent messages
 */
export async function classifyIntent(
  messages: Array<{ role: string; content: string }>
): Promise<IntentClassification> {
  const intentClassifierPrompt = await langfuse.getPrompt(
    'intent-classifier',
    undefined,
    {
      label: langfuseEnvironment,
      cacheTtlSeconds: ['development', 'preview'].includes(langfuseEnvironment)
        ? 0
        : 60
    }
  )

  const recentMessages = messages.slice(-5)
  const userMessage =
    messages.filter((message) => message.role === 'user')[messages.length - 1]
      ?.content ?? ''

  const classificationPrompt = intentClassifierPrompt.compile({
    userMessage: userMessage,
    recentMessages: recentMessages
      .map((message) => `[${message.role}] ${message.content}`)
      .join('\n')
  })

  try {
    const classification = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: classificationSchema,
      prompt: classificationPrompt
    })
    return classification.object
  } catch (error) {
    if (error instanceof NoObjectGeneratedError) {
      console.error('Classification failed: no valid object generated', {
        details: error.message
      })
      return {
        intentType: 'error',
        requiresTools: false,
        toolCategories: [],
        promptModules: [],
        reasoning: 'Fallback: model output did not match classification schema'
      }
    }

    console.error('Classification failed due to unexpected error', { error })
    return {
      intentType: 'error',
      requiresTools: false,
      toolCategories: [],
      promptModules: [],
      reasoning: 'Fallback: classification service unavailable'
    }
  }
}
