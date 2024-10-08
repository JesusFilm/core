import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    term
    ids
    languageIds
    expand
    filter
    metadataLanguageTags
*/

const GET_COUNTRIES = graphql(`
query Country {
  countries {
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

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams

  const page = Number(query.get('page') ?? 1)
  const limit = Number(query.get('limit') ?? 10)
  const offset = (page - 1) * limit

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_COUNTRIES>
  >({
    query: GET_COUNTRIES
  })

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries()),
    page: page.toString(),
    limit: limit.toString()
  }

  const queryString = new URLSearchParams(queryObject).toString()
  const firstQueryString = new URLSearchParams({
    ...queryObject,
    page: '1'
  }).toString()
  const lastQueryString = new URLSearchParams({
    ...queryObject,
    page: Math.ceil(data.countries.length / limit).toString()
  }).toString()
  const nextQueryString = new URLSearchParams({
    ...queryObject,
    page: (page + 1).toString()
  }).toString()

  const mediaCountries = data.countries.slice(offset, offset + limit).map((country) => ({
    countryId: country.id,
    name: country.name?.[0]?.value ?? '',
    continentName: country.continent?.name?.[0]?.value ?? '',
    longitude: country.longitude,
    latitude: country.latitude,
    counts: {
      languageCount: {
        value: country.languageCount,
        description: "Number of spoken languages"
      },
      population: {
        value: country.population,
        description: "Country population"
      },
      languageHavingMediaCount: {
        value: country.languageHavingMediaCount,
        description: "Number of languages having media"
      }
    },
    assets: {
      flagUrls: {
        png8: country.flagPngSrc,
        webpLossy50: country.flagWebpSrc
      }
    },
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-countries/${country.id}?apiKey=3a21a65d4gf98hZ7`
      }
    }
  }))

  const totalCountries = data.countries.length
  const totalPages = Math.ceil(totalCountries / limit)

  const response = {
    page,
    limit,
    pages: totalPages,
    total: totalCountries,
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-countries?${queryString}`
      },
      first: {
        href: `http://api.arclight.org/v2/media-countries?${firstQueryString}`
      },
      last: {
        href: `http://api.arclight.org/v2/media-countries?${lastQueryString}`
      },
      next: page < totalPages ? {
        href: `http://api.arclight.org/v2/media-countries?${nextQueryString}`
      } : undefined
    },
    _embedded: {
      mediaCountries
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
