import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ToolSet } from 'ai'

import { tools } from '../../tools'
import { IntentClassification } from '../classifyIntent'

const TOOL_CATEGORIES: Record<string, string[]> = {
  simple_crud: ['journeySimpleGet', 'journeySimpleUpdate'],
  plan: [
    'agentWebSearch',
    'agentGenerateImage',
    'youtubeAnalyzerTool',
    'journeySimpleGet',
    'journeySimpleUpdate'
  ]
}

export function selectTools(
  classification: IntentClassification,
  langfuseTraceId: string,
  apolloClient: ApolloClient<NormalizedCacheObject>
): ToolSet {
  if (!classification?.requiresTools) return {}

  const availableTools = tools(apolloClient, { langfuseTraceId })
  console.log('Tools available: ', Object.keys(availableTools))

  return classification.toolCategories.reduce((selectedTools, category) => {
    const toolCategory = TOOL_CATEGORIES[category] ?? []

    toolCategory.forEach((toolName) => {
      if (availableTools[toolName]) {
        selectedTools[toolName] = availableTools[toolName]
      }
    })

    return selectedTools
  }, {} as ToolSet)
}
