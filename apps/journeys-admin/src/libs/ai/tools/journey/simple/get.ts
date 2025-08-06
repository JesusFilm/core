import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { ToolOptions } from '../..'
import {
  JourneySimpleGet,
  JourneySimpleGetVariables
} from '../../../../../../__generated__/JourneySimpleGet'

/**
 * Helper to generate a JSON schema description from a Zod schema
 */
function getSchemaDescription(schema: typeof journeySimpleSchema): string {
  const jsonSchema = zodToJsonSchema(schema)
  return JSON.stringify(jsonSchema, null, 2)
}

// GraphQL query declaration
export const JOURNEY_SIMPLE_GET = gql`
  query JourneySimpleGet($id: ID!) {
    journeySimpleGet(id: $id)
  }
`

// Tool factory function for the AI tools system
export function journeySimpleGet(
  client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    description:
      'Fetches a simplified journey by ID and returns a validated JSON structure.' +
      '\n\nOutput schema (auto-generated from Zod):\n' +
      getSchemaDescription(journeySimpleSchema),
    parameters: z.object({
      journeyId: z.string().describe('The ID of the journey to fetch.')
    }),

    execute: async ({ journeyId }) => {
      try {
        // Call the real backend GraphQL query
        const { data } = await client.query<
          JourneySimpleGet,
          JourneySimpleGetVariables
        >({
          query: JOURNEY_SIMPLE_GET,
          variables: { id: journeyId }
        })
        // Validate the returned data with the Zod schema
        const result = journeySimpleSchema.safeParse(data.journeySimpleGet)
        if (!result.success) {
          throw new Error(
            'Returned journey is invalid: ' +
              JSON.stringify(result.error.format())
          )
        }
        return result.data
      } catch (error) {
        return {
          success: false,
          errors:
            error instanceof Error
              ? [{ message: error.message }]
              : [{ message: 'Invalid journey object' }]
        }
      }
    }
  })
}
