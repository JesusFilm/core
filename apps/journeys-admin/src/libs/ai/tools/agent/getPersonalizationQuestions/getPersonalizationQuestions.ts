import { google } from '@ai-sdk/google'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { generateObject, tool } from 'ai'
import { z } from 'zod'

import { ToolOptions } from '../..'
import { langfuse, langfuseEnvironment } from '../../../langfuse/server'

export function agentGetPersonalizationQuestions(
  _client: ApolloClient<NormalizedCacheObject>,
  { langfuseTraceId }: ToolOptions
) {
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
          }),
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'agent-get-personalization-questions',
            metadata: {
              langfuseTraceId,
              langfusePrompt: prompt.toJSON(),
              langfuseUpdateParent: false
            }
          }
        })

        return personalizationQuestions
      } catch (error) {
        return { error: 'Failed to get personalization questions' }
      }
    }
  })
}
