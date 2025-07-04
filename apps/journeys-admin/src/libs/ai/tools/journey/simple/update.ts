import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import {
  JourneySimple,
  journeySimpleSchema
} from '@core/shared/ai/journeySimpleTypes'

import { ToolOptions } from '../..'

// Simulated GraphQL endpoint for updating a journey
async function fakeGraphQLUpdateJourney(
  journeyId: string,
  journey: JourneySimple
): Promise<JourneySimple> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 100))
  // Return the journey as-is (could modify to simulate backend processing)
  return journey
}

function getSchemaDescription(schema: typeof journeySimpleSchema): string {
  const jsonSchema = zodToJsonSchema(schema)
  return JSON.stringify(jsonSchema, null, 2)
}

export function journeySimpleUpdate(
  _client: ApolloClient<NormalizedCacheObject>,
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
      const updated = await fakeGraphQLUpdateJourney(journeyId, journey)
      const result = journeySimpleSchema.safeParse(updated)
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
