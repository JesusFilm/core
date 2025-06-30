import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Tool, ToolSet } from 'ai'

import { tools as agentTools } from './agent'
import { tools as blockTools } from './block'
import { tools as clientTools } from './client'
import { tools as journeyTools } from './journey'

export interface ToolOptions {
  langfuseTraceId: string
}

export function tools(
  client: ApolloClient<NormalizedCacheObject>,
  { langfuseTraceId }: ToolOptions
): ToolSet {
  const allTools: Record<
    string,
    | ((
        client: ApolloClient<NormalizedCacheObject>,
        options: ToolOptions
      ) => Tool)
    | (() => Tool)
    | Tool
  > = {
    ...agentTools,
    ...blockTools,
    ...clientTools,
    ...journeyTools
  }

  const instantiatedTools: Record<string, Tool> = {}

  for (const key in allTools) {
    const toolOrFactory = allTools[key]
    if (typeof toolOrFactory === 'function') {
      try {
        // Attempt to call with client
        instantiatedTools[key] = (
          toolOrFactory as (
            client: ApolloClient<NormalizedCacheObject>,
            options: ToolOptions
          ) => Tool
        )(client, { langfuseTraceId })
      } catch {
        // If it fails, assume it's a factory without arguments
        instantiatedTools[key] = (toolOrFactory as () => Tool)()
      }
    } else {
      instantiatedTools[key] = toolOrFactory
    }
  }

  return instantiatedTools
}
