import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    ids
    rel
    languageIds
    expand
    metadataLanguageTags
    isDeprecated
*/

const GET_COUNTRIES_LANGUAGES = graphql(`
  query GetCountriesLanguages {
    countries {
      id
      countryLanguages {
        id
        language{
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

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams
  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_COUNTRIES_LANGUAGES>
  >({
    query: GET_COUNTRIES_LANGUAGES
  })

  const mediaCountriesLinks = [...data.countries]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((country) => ({
      countryId: country.id,
      linkedMediaLanguages: {
        suggested: country.countryLanguages
          .filter((countryLanguage) => countryLanguage.suggested === true && countryLanguage.order)
          .sort((a, b) => Number(b.order) - Number(a.order))
          .map(({ language, order }) => ({
            languageId: Number(language.id),
            languageRank: order ?? 0
          })),
        spoken: country.countryLanguages
          .filter((countryLanguage) => countryLanguage.speakers > 0 && countryLanguage.suggested === false)
          .sort((a, b) => b.speakers - a.speakers)
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
        href: `https://api.arclight.com/v2/media-country-links?${queryString}`
      }
    },
    _embedded: {
      mediaCountriesLinks
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}
