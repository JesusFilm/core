import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ToolSet } from 'ai'

import { getJourney } from './getJourney'
import { updateBlock } from './updateBlock'
import { updateJourney } from './updateJourney'

export function tools(client: ApolloClient<NormalizedCacheObject>): ToolSet {
  return {
    getJourney: getJourney(client),
    updateJourney: updateJourney(client),
    updateBlock: updateBlock(client)
  }
}
