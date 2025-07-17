import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../lib/cache'

const GET_COUNTRIES_LANGUAGES = graphql(`
  query GetCountriesLanguages {
    countries {
      id
      countryLanguages {
        id
        language {
          id
        }
        speakers
        displaySpeakers
        primary
        suggested
        order
      }
    }
  }
`)

export const mediaCountryLinks = new OpenAPIHono()

const QuerySchema = z.object({
  ids: z.string().optional(),
  metadataLanguageTags: z.string().optional()
})

const ResponseSchema = z.object({
  _links: z.object({
    self: z.object({
      href: z.string()
    })
  }),
  _embedded: z.object({
    mediaCountriesLinks: z.array(
      z.object({
        countryId: z.string(),
        linkedMediaLanguages: z.object({
          suggested: z.array(
            z.object({
              languageId: z.number(),
              languageRank: z.number()
            })
          ),
          spoken: z.array(
            z.object({
              languageId: z.number(),
              speakerCount: z.number()
            })
          )
        })
      })
    )
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Countries'],
  summary: 'Get media country links',
  description: 'Get media country links',
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
      description: 'Media country links'
    }
  }
})

mediaCountryLinks.openapi(route, async (c) => {
  const ids = c.req.query('ids')?.split(',') ?? []
  const apiKey = c.req.query('apikey')

  const cacheKey = generateCacheKey(['media-country-links', ...ids])

  const response = await getWithStaleCache(cacheKey, async () => {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_COUNTRIES_LANGUAGES>
    >({
      query: GET_COUNTRIES_LANGUAGES
    })

    const mediaCountriesLinks = [...data.countries]
      .filter((country) => (ids.length > 0 ? ids?.includes(country.id) : true))
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((country) => ({
        countryId: country.id,
        linkedMediaLanguages: {
          suggested: country.countryLanguages
            .filter(
              (countryLanguage) =>
                countryLanguage.suggested && countryLanguage.order
            )
            .sort((a, b) => Number(b.order) - Number(a.order))
            .map(({ language }, index, array) => ({
              languageId: Number(language.id),
              languageRank: array.length - index
            })),
          spoken: country.countryLanguages
            .filter((countryLanguage) => !countryLanguage.suggested)
            .sort((a, b) => {
              const speakerDiff = b.speakers - a.speakers
              return speakerDiff !== 0
                ? speakerDiff
                : Number(a.language.id) - Number(b.language.id)
            })
            .map(({ language, speakers }) => ({
              languageId: Number(language.id),
              speakerCount: speakers
            }))
        }
      }))

    return {
      _links: {
        self: {
          href: `http://api.arclight.org/v2/media-country-links?$apikey=${apiKey}`
        }
      },
      _embedded: {
        mediaCountriesLinks
      }
    }
  })

  return c.json(response)
})
