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
      name {
        value
      }
      continent {
        name {
          value
        }
      }
      # TODO: Add these fields to the GraphQL schema if not already present
      # languageCount
      # languageHavingMediaCount
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
    longitude: data.country.longitude,
    latitude: data.country.latitude,
    counts: {
      languageCount: {
        // TODO:
        // value: data.country.languageCount,
        description: "Number of spoken languages"
      },
      population: {
        value: data.country.population,
        description: "Country population"
      },
      languageHavingMediaCount: {
        // TODO:
        // value: data.country.languageHavingMediaCount,
        description: "Number of languages having media"
      }
    },
    assets: {
      flagUrls: {
        png8: data.country.flagPngSrc,
        webpLossy50: data.country.flagWebpSrc
      }
    },
    name: data.country.name[0].value,
    nameNative: data.country.name[1]?.value ?? data.country.name[0].value,
    continent: data.country.continent.name[0].value,
    // TODO: default to en pull from querystrings
    metadataLanguageTag: '',
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-countries/${countryId}?${queryString}`
      }
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
