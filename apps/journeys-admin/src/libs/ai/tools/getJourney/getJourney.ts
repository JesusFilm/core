import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

const GET_ADMIN_JOURNEY = gql`
  query GetAdminJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      title
      description
    }
  }
`

export function getJourney(client: ApolloClient<NormalizedCacheObject>): Tool {
  return tool({
    description: 'Get the journey.',
    parameters: z.object({
      journeyId: z.string().describe('The id of the journey.')
    }),
    execute: async ({ journeyId }) => {
      try {
        const result = await client.query({
          query: GET_ADMIN_JOURNEY,
          variables: { id: journeyId }
        })
        return result.data?.journey
      } catch (error) {
        return error
      }
    }
  })
}
