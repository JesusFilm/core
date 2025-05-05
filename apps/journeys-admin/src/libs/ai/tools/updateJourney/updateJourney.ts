import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'

const AI_UPDATE_JOURNEY = gql`
  mutation AiUpdateJourney($id: ID!, $title: String, $description: String) {
    journeyUpdate(
      id: $id
      input: { title: $title, description: $description }
    ) {
      id
      title
      description
    }
  }
`

export function updateJourney(
  client: ApolloClient<NormalizedCacheObject>
): Tool {
  return tool({
    description: 'Update the journey.',
    parameters: z.object({
      journeyId: z.string().describe('The id of the journey.'),
      title: z.string().describe('The title of the journey.'),
      description: z.string().describe('The description of the journey.')
    }),
    execute: async ({ journeyId, title, description }) => {
      try {
        const result = await client.mutate({
          mutation: AI_UPDATE_JOURNEY,
          variables: { id: journeyId, title, description }
        })
        return result.data?.journeyUpdate
      } catch (error) {
        return error
      }
    }
  })
}
