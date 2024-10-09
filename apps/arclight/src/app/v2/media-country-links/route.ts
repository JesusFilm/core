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

  const mediaCountriesLinks = data.countries.map((country) => ({
    countryId: country.id,
    linkedMediaLanguages: {
      suggested: country.countryLanguages
        .filter((lang) => lang.primary)
      .map(({ language }) => ({
        languageId: language.id
      })),
      spoken: country.countryLanguages
        .filter((lang) => lang.speakers > 0)
        .sort((a, b) => b.speakers - a.speakers)
        .map(({ language, speakers }) => ({
          languageId: language.id,
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
