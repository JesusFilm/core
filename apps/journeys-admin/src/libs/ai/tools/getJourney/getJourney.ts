import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { transformer } from '@core/journeys/ui/transformer'

import {
  GetAdminJourney,
  GetAdminJourneyVariables
} from '../../../../../__generated__/GetAdminJourney'

const GET_ADMIN_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetAdminJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      ...JourneyFields
    }
  }
`

export function getJourney(client: ApolloClient<NormalizedCacheObject>): Tool {
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
          GetAdminJourney,
          GetAdminJourneyVariables
        >({
          query: GET_ADMIN_JOURNEY,
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
        return error
      }
    }
  })
}
