import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ToolSet } from 'ai'

import { tools as agentTools } from './agent'
// import { tools as clientTools } from './client'
import { tools as journeyTools } from './journey'
import {
  youTubeTranscriptTool,
  youtubeAnalyzerTool,
  youtubeAnalyzerTool2
} from './youtube'

export interface ToolOptions {
  langfuseTraceId: string
}

export function tools(
  client: ApolloClient<NormalizedCacheObject>,
  { langfuseTraceId }: ToolOptions
): ToolSet {
  const tools = {
    ...agentTools,
    // ...clientTools,
    ...journeyTools,
    // youTubeTranscriptTool,
    // youtubeAnalyzerTool,
    youtubeAnalyzerTool2
  }

  return {
    ...Object.fromEntries(
      Object.entries(tools).map(([key, tool]) => [
        key,
        tool(client, { langfuseTraceId })
      ])
    )
  }
}
