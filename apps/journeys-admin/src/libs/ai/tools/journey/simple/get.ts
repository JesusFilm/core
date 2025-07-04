import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import {
  JourneySimple,
  journeySimpleSchema
} from '@core/shared/ai/journeySimpleTypes'

import { ToolOptions } from '../..'

// Example stubbed journey data (top-level)
const stubbedJourney: JourneySimple = {
  title: 'Sample Journey',
  description: 'A sample journey for demonstration purposes.',
  cards: [
    {
      heading: 'Welcome',
      text: 'This is the first card.',
      button: { text: 'Continue', nextCard: 1 },
      poll: [
        { text: 'Option 1', nextCard: 2 },
        { text: 'Option 2', nextCard: 3 }
      ],
      image: 'https://example.com/image.jpg',
      backgroundImage: 'https://example.com/bg.jpg',
      nextCard: 1
    },
    {
      heading: 'Second Card',
      text: 'This is the second card.',
      nextCard: 2
    },
    {
      heading: 'Third Card',
      text: 'This is the third card.'
    }
  ]
}

/**
 * Helper to generate a JSON schema description from a Zod schema
 */
function getSchemaDescription(schema: typeof journeySimpleSchema): string {
  const jsonSchema = zodToJsonSchema(schema)
  return JSON.stringify(jsonSchema, null, 2)
}

// Tool factory function for the AI tools system
export function journeySimpleGet(
  _client: ApolloClient<NormalizedCacheObject>,
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
      // Validate the stubbed data before returning
      const result = journeySimpleSchema.safeParse(stubbedJourney)
      if (!result.success) {
        throw new Error(
          'Stubbed journey data is invalid: ' +
            JSON.stringify(result.error.format())
        )
      }
      return result.data
    }
  })
}
