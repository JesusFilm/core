import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { languageSchema } from '@core/shared/ai/languageTypes'

import { ToolOptions } from '../index'

function getSchemaDescription(schema: typeof languageSchema): string {
  const jsonSchema = zodToJsonSchema(schema)
  return JSON.stringify(jsonSchema, null, 2)
}

export const LOAD_LANGUAGES = gql`
  query LoadLanguages($subtitles: [ID!]!) {
    languages(where: { ids: $subtitles }) {
      id
      slug
    }
  }
`

export function loadLanguages(
  client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    description:
      'Fetches language records by subtitle IDs and returns an array of language objects with id and slug fields.' +
      '\n\nOutput schema (auto-generated from Zod):\n' +
      getSchemaDescription(languageSchema),
    parameters: z.object({
      subtitles: z.array(z.string()).describe('Array of subtitle IDs to look up languages for.')
    }),

    execute: async ({ subtitles }) => {
      try {
        const result = await client.query({
          query: LOAD_LANGUAGES,
          variables: { subtitles },
          errorPolicy: 'all',
          fetchPolicy: 'no-cache'
        })

        const data = result.data
        const languages = data.languages || []
        
        // Validate each language object
        const validatedLanguages = languages.map((language: any) => {
          const validationResult = languageSchema.safeParse(language)
          if (!validationResult.success) {
            throw new Error(
              `Invalid language data for ID ${language?.id}: ` +
                JSON.stringify(validationResult.error.format())
            )
          }
          return validationResult.data
        })

        return validatedLanguages
      } catch (error) {
        console.error('Error in loadLanguages:', error.message)
        throw error
      }
    }
  })
}