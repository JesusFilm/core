import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../../lib/cache'
import { findBestMatchingName } from '../lib'

const GET_TAXONOMY = graphql(`
  query GetTaxonomy($category: String!, $languageCodes: [String!]) {
    taxonomies(category: $category) {
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

const ResponseSchema = z.object({
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

const QuerySchema = z.object({
  metadataLanguageTags: z
    .string()
    .optional()
    .describe('Filter by metadata language tags'),
  apiKey: z.string().optional().describe('API key')
})

export const taxonomiesWithCategory = new OpenAPIHono()

const getTaxonomyByCategoryRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['taxonomy'],
  summary:
    'Returns a resource containing terms contained within a given taxonomy.',
  request: {
    params: z.object({
      category: z.string().describe('The category (name) of the taxonomy.')
    }),
    query: QuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'A list of terms for the specified taxonomy category.'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            logref: z.number().optional()
          })
        }
      },
      description: 'Taxonomy category not found.'
    }
  }
} as const)

taxonomiesWithCategory.openapi(getTaxonomyByCategoryRoute, async (c) => {
  const category = c.req.param('category')
  const metadataLanguageTagsQuery = c.req.query('metadataLanguageTags')
  const metadataLanguageTags =
    metadataLanguageTagsQuery && metadataLanguageTagsQuery.length > 0
      ? metadataLanguageTagsQuery.split(',')
      : ['en']
  const apiKey = c.req.query('apiKey') ?? ''

  const cacheKey = generateCacheKey([
    'taxonomy',
    category ?? '',
    ...metadataLanguageTags
  ])

  const response = await getWithStaleCache(cacheKey, async () => {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_TAXONOMY>
    >({
      query: GET_TAXONOMY,
      variables: {
        category,
        languageCodes: metadataLanguageTags
      }
    })

    if (data.taxonomies.length === 0) {
      return {
        message: `Taxonomy '${category}' not found!`,
        logref: 404
      }
    }

    const response = {
      terms: {} as Record<
        string,
        { label: string; metadataLanguageTag: string }
      >,
      _links: {
        self: {
          href: `http://api.arclight.org/v2/taxonomies/${category}?apiKey=${apiKey}`
        },
        taxonomies: {
          href: `http://api.arclight.org/v2/taxonomies?apiKey=${apiKey}`
        }
      }
    }

    data.taxonomies.forEach((taxonomy) => {
      if (taxonomy.name.length === 0) return

      const matchingName = findBestMatchingName(
        taxonomy.name as Array<{ label: string; language: { bcp47: string } }>,
        metadataLanguageTags
      )

      response.terms[taxonomy.term] = {
        label: matchingName.label,
        metadataLanguageTag: matchingName.language.bcp47
      }
    })

    return response
  })

  if ('message' in response) {
    return c.json(response, 404)
  }

  return c.json(response, 200)
})
