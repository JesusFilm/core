import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { Messages } from '../../../../app/api/chat/route'

import { buildDynamicPrompt } from './buildDynamicPrompt'
import { classifyIntent } from './classifyIntent'
import { selectTools } from './selectTools'

/**
 * Orchestrates the request processing by classifying intent, dynamically building prompts and selecting tools
 */
export async function orchestrateRequest(
  messages: Messages,
  langfuseTraceId: string,
  params: {
    journeyId?: string
    selectedStepId?: string
    selectedBlockId?: string
    apolloClient: ApolloClient<NormalizedCacheObject>
  }
) {
  const classification = await classifyIntent(messages)

  const dynamicSystemPrompt = await buildDynamicPrompt(classification, {
    journeyId: params.journeyId ?? 'none',
    selectedStepId: params.selectedStepId ?? 'none',
    selectedBlockId: params.selectedBlockId ?? 'none'
  })

  const selectedTools = selectTools(
    classification,
    langfuseTraceId,
    params.apolloClient
  )

  console.log('Classification: ', classification)
  console.log('Dynamic system prompt: ', dynamicSystemPrompt)
  console.log('Tools selected: ', Object.keys(selectedTools))

  return {
    classification,
    finalSystemPrompt: dynamicSystemPrompt,
    selectedTools
  }
}
