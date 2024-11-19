import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

const GET_LANGUAGE_ID_FROM_BCP47 = graphql(`
  query GetLanguageIdFromBCP47($bcp47: ID!) {
    language(id: $bcp47, idType: bcp47) {
      id
    }
  }
`)

const GET_COUNTRIES = graphql(`
  query Country($languageId: ID!, $fallbackLanguageId: ID!) {
    countries {
      id
      population
      latitude
      longitude
      flagPngSrc
      flagWebpSrc
      name(languageId: $languageId) {
        value
      }
      fallbackName: name(languageId: $fallbackLanguageId) {
        value
      }
      continent {
        name(languageId: $languageId) {
          value
        }
        fallbackName: name(languageId: $fallbackLanguageId) {
          value
        }
      }
      countryLanguages {
        language {
          id
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
  const expand = query.get('expand')
  const offset = (page - 1) * limit
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',') ?? []

  let languageId = '529'
  let fallbackLanguageId = ''
  if (metadataLanguageTags.length > 0 && metadataLanguageTags[0] !== 'en') {
    const { data: languageIdsData } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[0] }
    })

    languageId = languageIdsData.language?.id ?? '529'
  }
  if (metadataLanguageTags.length > 1) {
    const { data: languageIdsData } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[1] }
    })

    fallbackLanguageId = languageIdsData.language?.id ?? '529'
  }

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_COUNTRIES>
  >({
    query: GET_COUNTRIES,
    variables: {
      languageId,
      fallbackLanguageId
    }
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

  const mediaCountries = data.countries
    .slice(offset, offset + limit)
    .map((country) => ({
      countryId: country.id,
      name: country.name[0]?.value ?? country.fallbackName?.[0]?.value ?? '',
      continentName:
        country.continent?.name[0]?.value ??
        country.continent?.fallbackName[0]?.value ??
        '',
      longitude: country.longitude,
      latitude: country.latitude,
      counts: {
        languageCount: {
          value: country.languageCount,
          description: 'Number of spoken languages'
        },
        population: {
          value: country.population,
          description: 'Country population'
        },
        languageHavingMediaCount: {
          value: country.languageHavingMediaCount,
          description: 'Number of languages having media'
        }
      },
      assets: {
        flagUrls: {
          png8: country.flagPngSrc,
          webpLossy50: country.flagWebpSrc
        }
      },
      ...(expand === 'languageIds'
        ? {
            languageIds: country.countryLanguages.map((countryLanguage) =>
              Number(countryLanguage.language.id)
            )
          }
        : {}),
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
      next:
        page < totalPages
          ? {
              href: `http://api.arclight.org/v2/media-countries?${nextQueryString}`
            }
          : undefined
    },
    _embedded: {
      mediaCountries
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
