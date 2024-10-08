import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    expand
    metadataLanguageTags
    filter
  api:
    country data & counts
*/

const GET_COUNTRY = graphql(`
  query GetCountry($id: ID!) {
    country(id: $id) {
      id
      population
      latitude
      longitude
      flagPngSrc
      flagWebpSrc
      name (languageId: "529") {
        value
      }
      continent {
        name {
          value
        }
      }
      languageCount
      languageHavingMediaCount
    }
  }
`)

interface GetParams {
  params: { countryId: string }
}

export async function GET(
  request: NextRequest,
  { params }: GetParams
): Promise<Response> {
  const query = request.nextUrl.searchParams
  const { countryId } = params

  const { data } = await getApolloClient().query<ResultOf<typeof GET_COUNTRY>>(
    {
      query: GET_COUNTRY,
      variables: {
        id: countryId
      }
    }
  )

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  if (data.country == null)
    return new Response(
      JSON.stringify({
        message: `${countryId}:\n  The requested country ID '${countryId}' not found.\n`,
        logref: 404
      }),
      { status: 404 }
    )

  const queryString = new URLSearchParams(queryObject).toString()

  const response = {
    countryId,
    name: data.country.name?.[0]?.value ?? '',
    continentName: data.country.continent?.name?.[0]?.value ?? '',
    metadataLanguageTag: 'en',
    longitude: data.country.longitude,
    latitude: data.country.latitude,
    counts: {
      languageCount: {
        value: data.country.languageCount,
        description: "Number of spoken languages"
      },
      population: {
        value: data.country.population,
        description: "Country population"
      },
      languageHavingMediaCount: {
        value: data.country.languageHavingMediaCount,
        description: "Number of languages having media"
      }
    },
    assets: {
      flagUrls: {
        png8: data.country.flagPngSrc,
        webpLossy50: data.country.flagWebpSrc
      }
    },
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-countries/${countryId}?${queryString}`
      }
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
