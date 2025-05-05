import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ToolSet } from 'ai'

import { getJourney } from './getJourney'
import { updateJourney } from './updateJourney'

export function tools(client: ApolloClient<NormalizedCacheObject>): ToolSet {
  return {
    getJourney: getJourney(client),
    updateJourney: updateJourney(client)
  }
}
