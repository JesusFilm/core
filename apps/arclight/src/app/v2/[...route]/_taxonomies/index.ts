import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'

import { getApolloClient } from '../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../lib/cache'

import { taxonomiesWithCategory } from './[category]'
import { TaxonomyGroup, findBestMatchingName } from './lib'

const GET_TAXONOMIES = graphql(`
  query GetTaxonomies($languageCodes: [String!]) {
    taxonomies {
      category
      term
      name(languageCodes: $languageCodes) {
        label
        language {
          bcp47
        }
      }
    }
  }
`)

const QuerySchema = z.object({
  metadataLanguageTags: z
    .string()
    .optional()
    .describe(
      'Comma-separated list of BCP-47 language tags for metadata localization (e.g., en,es). Defaults to en.'
    ),
  apiKey: z.string().optional().describe('API key for authentication.')
})

const ResponseSchema = z.object({
  _links: z.object({
    self: z.object({ href: z.string().url() })
  }),
  _embedded: z.object({
    taxonomies: z.record(
      z.string(), // category
      z.object({
        terms: z.record(
          z.string(), // term
          z.object({
            label: z.string(),
            metadataLanguageTag: z.string()
          })
        ),
        _links: z.object({
          self: z.object({ href: z.string().url() }),
          taxonomies: z.object({ href: z.string().url() })
        })
      })
    )
  })
})

export const taxonomies = new OpenAPIHono()
taxonomies.route('/:category', taxonomiesWithCategory)

const listTaxonomiesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['taxonomy'],
  summary: 'Returns media-component taxonomies and their associated terms.',
  request: {
    query: QuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'A list of taxonomies grouped by category, with their terms.'
    },
    406: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Not acceptable metadata language tag(s) provided.'
    }
  }
} as const)

taxonomies.openapi(listTaxonomiesRoute, async (c) => {
  const metadataLanguageTags = c.req
    .query('metadataLanguageTags')
    ?.split(',') ?? ['en']
  const apiKey = c.req.query('apiKey') ?? ''

  const cacheKey = generateCacheKey(['taxonomies', ...metadataLanguageTags])

  const response = await getWithStaleCache(cacheKey, async () => {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_TAXONOMIES>
    >({
      query: GET_TAXONOMIES,
      variables: { languageCodes: metadataLanguageTags }
    })

    const groupedTaxonomies: Record<string, TaxonomyGroup> = {}

    const filteredTaxonomies = data.taxonomies.filter(
      (taxonomy) => taxonomy.name.length > 0
    )

    if (filteredTaxonomies.length === 0) {
      return null
    }

    filteredTaxonomies.forEach((taxonomy) => {
      const matchingName = findBestMatchingName(
        taxonomy.name as Array<{ label: string; language: { bcp47: string } }>,
        metadataLanguageTags
      )

      if (groupedTaxonomies[taxonomy.category] === undefined) {
        groupedTaxonomies[taxonomy.category] = {
          terms: {
            [taxonomy.term]: {
              label: matchingName.label,
              metadataLanguageTag: matchingName.language.bcp47
            }
          },
          _links: {
            self: {
              href: `http://api.arclight.org/v2/taxonomies/${taxonomy.category}?apiKey=${apiKey}`
            },
            taxonomies: {
              href: `http://api.arclight.org/v2/taxonomies?apiKey=${apiKey}`
            }
          }
        }
      } else {
        groupedTaxonomies[taxonomy.category].terms[taxonomy.term] = {
          label: matchingName.label,
          metadataLanguageTag: matchingName.language.bcp47
        }
      }
    })

    return {
      _links: {
        self: { href: `http://api.arclight.org/v2/taxonomies?apiKey=${apiKey}` }
      },
      _embedded: { taxonomies: groupedTaxonomies }
    }
  })

  if (response == null) {
    return c.json(
      {
        message: `Not acceptable metadata language tag(s): ${metadataLanguageTags.join(', ')}`
      },
      406
    )
  }
  return c.json(response, 200)
})
