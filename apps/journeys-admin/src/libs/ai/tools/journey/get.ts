import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { transformer } from '@core/journeys/ui/transformer'

import {
  AiJourneyGetQuery,
  AiJourneyGetQueryVariables
} from '../../../../../__generated__/AiJourneyGetQuery'

const AI_JOURNEY_GET = gql`
  ${JOURNEY_FIELDS}
  query AiJourneyGetQuery($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

export function journeyGet(client: ApolloClient<NormalizedCacheObject>): Tool {
  return tool({
    description: `
      You can use this tool to get the journey and its blocks.
      Blocks are the building blocks of a journey.
      They can be of different types, such as text, image, video, etc.
      You can use this tool to also get the blocks of the journey.
      `,
    parameters: z.object({
      journeyId: z.string().describe('The id of the journey.')
    }),
    execute: async ({ journeyId }) => {
      try {
        const result = await client.query<
          AiJourneyGetQuery,
          AiJourneyGetQueryVariables
        >({
          query: AI_JOURNEY_GET,
          variables: { id: journeyId }
        })
        if (result.data?.journey.blocks == null) {
          return null
        }
        return {
          ...result.data.journey,
          blocks: transformer(result.data.journey.blocks)
        }
      } catch (error) {
        console.error(error)
        return `Error getting journey: ${error}`
      }
    }
  })
}
