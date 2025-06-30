import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'

import { langfuse, langfuseEnvironment } from '../../../langfuse/server'

export function agentWebSearch() {
  return tool({
    description: 'Searches the web for information.',
    parameters: z.object({
      prompt: z.string().describe('The query to search the web for.'),
      url: z.string().describe('The URL to scope your results to.').optional()
    }),
    execute: async ({ prompt, url }) => {
      try {
        const getPrompt = await langfuse.getPrompt(
          'system/ai/tools/agent/webSearch',
          undefined,
          {
            label: langfuseEnvironment,
            cacheTtlSeconds: process.env.VERCEL_ENV === 'preview' ? 0 : 60
          }
        )

        const systemPrompt = getPrompt.compile({})

        const result = await generateText({
          model: openai.responses('gpt-4o-mini'),
          system: systemPrompt,
          prompt: `${url != null ? `\n\nSCOPED_URL: ${url}` : ''} ${prompt}`,
          tools: {
            web_search_preview: openai.tools.webSearchPreview({
              searchContextSize: 'high'
            })
          },
          toolChoice: { type: 'tool', toolName: 'web_search_preview' }
        })
        return result.text
      } catch (error) {
        return `Error performing web search: ${error}`
      }
    }
  })
}
