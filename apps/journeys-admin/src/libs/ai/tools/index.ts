import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ToolSet } from 'ai'

import { tools as blockTools } from './block'
import { tools as clientTools } from './client'
import { tools as journeyTools } from './journey'

export function tools(client: ApolloClient<NormalizedCacheObject>): ToolSet {
  const tools = {
    ...blockTools,
    ...clientTools,
    ...journeyTools
  }

  return {
    ...Object.fromEntries(
      Object.entries(tools).map(([key, tool]) => [key, tool(client)])
    )
  }
}
