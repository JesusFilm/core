import { ResultOf, graphql } from 'gql.tada'
import { Hono } from 'hono'

import { getApolloClient } from '../../../../lib/apolloClient'

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

export const mediaCountryLinks = new Hono()

mediaCountryLinks.get('/', async (c) => {
  const queryObject = c.req.query()

  const ids = queryObject.ids?.split(',') ?? []

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

  const queryString = new URLSearchParams(queryObject).toString()
  const response = {
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-country-links?${queryString}`
      }
    },
    _embedded: {
      mediaCountriesLinks
    }
  }
  return c.json(response)
})
