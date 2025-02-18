import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { generateETag } from '../../../lib/etag'
import { getLanguageIdsFromTags } from '../../../lib/getLanguageIdsFromTags'
import { paramsToRecord } from '../../../lib/paramsToRecord'

const GET_COUNTRIES = graphql(`
  query Country(
    $metadataLanguageId: ID!
    $fallbackLanguageId: ID!
    $ids: [ID!]
  ) {
    countries(ids: $ids) {
      id
      population
      latitude
      longitude
      flagPngSrc
      flagWebpSrc
      name(languageId: $metadataLanguageId) {
        value
      }
      fallbackName: name(languageId: $fallbackLanguageId) {
        value
      }
      continent {
        name(languageId: $metadataLanguageId) {
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
  const idsParam = query.get('ids')
  const ids = idsParam ? idsParam.split(',') : undefined
  const expand = query.get('expand')
  const offset = (page - 1) * limit
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',') ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof Response) {
    return languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_COUNTRIES>
  >({
    query: GET_COUNTRIES,
    variables: {
      ids,
      metadataLanguageId,
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
    .filter(
      (country) =>
        country.name[0]?.value != null || country.fallbackName[0]?.value != null
    )
    .map((country) => ({
      countryId: country.id,
      name: country.name[0]?.value ?? country.fallbackName?.[0]?.value ?? '',
      continentName:
        country.continent?.name[0]?.value ??
        country.continent?.fallbackName[0]?.value ??
        '',
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
      longitude: country.longitude ? country.longitude : 0,
      latitude: country.latitude ? country.latitude : 0,
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

  const responseJson = JSON.stringify(response)
  const etag = await generateETag(responseJson)
+  const ifNoneMatch = request.headers.get('If-None-Match')
+  if (ifNoneMatch === etag) {
+    return new Response(null, {
+      status: 304,
+      headers: { ETag: etag }
+    })
+  }

  return new Response(responseJson, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ETag: etag
    }
  })
}
