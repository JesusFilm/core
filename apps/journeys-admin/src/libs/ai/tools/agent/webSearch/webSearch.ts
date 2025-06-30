import { openai } from '@ai-sdk/openai'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Tool, generateText, tool } from 'ai'
import { z } from 'zod'

import { ToolOptions } from '../..'
import { langfuse, langfuseEnvironment } from '../../../langfuse/server'

export function agentWebSearch(
  _client: ApolloClient<NormalizedCacheObject>,
  { langfuseTraceId }: ToolOptions
): Tool {
  return tool({
    parameters: z.object({
      prompt: z.string().describe('The query to search the web for.'),
      url: z.string().describe('The URL to scope your results to.').optional()
    }),
    execute: async ({ prompt, url }) => {
      try {
        const systemPrompt = await langfuse.getPrompt(
          'ai-tools-agent-web-search-system-prompt',
          undefined,
          {
            label: langfuseEnvironment,
            cacheTtlSeconds: process.env.VERCEL_ENV === 'preview' ? 0 : 60
          }
        )
        const result = await generateText({
          model: openai.responses('gpt-4o-mini'),
          system: systemPrompt.prompt,
          prompt: `${url ? `\n\nSCOPED_URL: ${url}` : ''} ${prompt}`,
          tools: {
            web_search_preview: openai.tools.webSearchPreview({
              searchContextSize: 'high'
            })
          },
          toolChoice: { type: 'tool', toolName: 'web_search_preview' },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'agent-web-search',
            metadata: {
              langfuseTraceId,
              langfusePrompt: systemPrompt.toJSON(),
              langfuseUpdateParent: false
            }
          }
        })
        return result.text
      } catch (error) {
        return `Error performing web search: ${error}`
      }
    }
  })
}
