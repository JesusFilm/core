import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { ToolOptions } from '../..'
import {
  JourneySimpleUpdate,
  JourneySimpleUpdateVariables
} from '../../../../../../__generated__/JourneySimpleUpdate'

// GraphQL mutation declaration
export const JOURNEY_SIMPLE_UPDATE = gql`
  mutation JourneySimpleUpdate($id: ID!, $journey: Json!) {
    journeySimpleUpdate(id: $id, journey: $journey)
  }
`

function getSchemaDescription(schema: typeof journeySimpleSchema): string {
  const jsonSchema = zodToJsonSchema(schema)
  return JSON.stringify(jsonSchema, null, 2)
}

export function journeySimpleUpdate(
  client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    description:
      'Updates a journey by ID and returns the validated result.' +
      '\n\nOutput schema (auto-generated from Zod):\n' +
      getSchemaDescription(journeySimpleSchema),
    parameters: z.object({
      journeyId: z.string().describe('The ID of the journey to update.'),
      journey: journeySimpleSchema.describe(
        'The new journey object to replace the existing journey.'
      )
    }),
    execute: async ({ journeyId, journey }) => {
      const { data } = await client.mutate<
        JourneySimpleUpdate,
        JourneySimpleUpdateVariables
      >({
        mutation: JOURNEY_SIMPLE_UPDATE,
        variables: { id: journeyId, journey }
      })
      const result = journeySimpleSchema.safeParse(data?.journeySimpleUpdate)
      if (!result.success) {
        throw new Error(
          'Returned journey is invalid: ' +
            JSON.stringify(result.error.format())
        )
      }
      return result.data
    }
  })
}
