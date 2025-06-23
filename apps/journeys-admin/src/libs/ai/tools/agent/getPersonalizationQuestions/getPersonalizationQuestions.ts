import { google } from '@ai-sdk/google'
import { generateObject, tool } from 'ai'
import { z } from 'zod'

import { langfuse, langfuseEnvironment } from '../../../langfuse/server'

export function agentGetPersonalizationQuestions() {
  return tool({
    description:
      'From a given markdown, returns a structured list of questions to ask the user in order to personalize the journey.',
    parameters: z.object({
      markdown: z
        .string()
        .describe('The markdown description of a template to inspect.')
    }),
    execute: async ({ markdown }) => {
      try {
        const prompt = await langfuse.getPrompt(
          'system/ai/tools/agent/getPersonalizationQuestions',
          undefined,
          {
            label: langfuseEnvironment,
            cacheTtlSeconds: process.env.VERCEL_ENV === 'preview' ? 0 : 60
          }
        )

        const systemPrompt = prompt.compile({})

        const { object: personalizationQuestions } = await generateObject({
          model: google('gemini-2.0-flash'),
          system: systemPrompt,
          prompt: markdown,
          schema: z.object({
            questions: z.array(
              z.object({
                variable: z.string(),
                question: z.string()
              })
            )
          })
        })

        return personalizationQuestions
      } catch (error) {
        console.error('Error getting personalization questions:', error)
        return { error: 'Failed to get personalization questions' }
      }
    }
  })
}
