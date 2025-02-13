import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { getLanguageIdsFromTags } from '../../../lib/getLanguageIdsFromTags'
import { paramsToRecord } from '../../../lib/paramsToRecord'

const GET_LANGUAGES = graphql(`
  query GetLanguagesWithTags(
    $limit: Int!
    $offset: Int!
    $ids: [ID!]
    $bcp47: [String!]
    $iso3: [String!]
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
    $term: String
  ) {
    languagesCount(
      where: { ids: $ids, bcp47: $bcp47, iso3: $iso3 }
      term: $term
    )
    languages(
      limit: $limit
      offset: $offset
      where: { ids: $ids, bcp47: $bcp47, iso3: $iso3 }
      term: $term
    ) {
      id
      iso3
      bcp47
      name(languageId: $metadataLanguageId) {
        value
        primary
        language {
          bcp47
        }
      }
      fallbackName: name(languageId: $fallbackLanguageId) {
        value
        primary
      }
      nameNative: name {
        value
        primary
      }
      audioPreview {
        size
        value
        duration
        bitrate
        codec
      }
      countryLanguages {
        country {
          id
        }
        speakers
        primary
        suggested
      }
      seriesCount
      featureFilmCount
      shortFilmCount
    }
  }
`)

export const maxDuration = 60

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams

  const apiKey = query.get('apiKey')
  const page = Number(query.get('page') ?? 1)
  const limit = Number(query.get('limit') ?? 10)
  const offset = (page - 1) * limit
  const bcp47 = query.get('bcp47')?.split(',')
  const ids = query.get('ids')?.split(',')
  const iso3 = query.get('iso3')?.split(',')
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',') ?? []
  const term = query.get('term')

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof Response) {
    return languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_LANGUAGES>
  >({
    query: GET_LANGUAGES,
    variables: {
      limit,
      offset,
      ids,
      bcp47,
      iso3,
      metadataLanguageId,
      fallbackLanguageId,
      term
    }
  })
  const languages = data.languages

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries()),
    page: page.toString(),
    limit: limit.toString()
  }

  const totalPages = Math.ceil(Number(data.languagesCount) / limit)
  const queryString = new URLSearchParams(queryObject).toString()
  const firstQueryString = new URLSearchParams({
    ...queryObject,
    page: '1'
  }).toString()
  const lastQueryString = new URLSearchParams({
    ...queryObject,
    page: totalPages.toString()
  }).toString()
  const nextQueryString = new URLSearchParams({
    ...queryObject,
    page: (page + 1).toString()
  }).toString()
  const previousQueryString = new URLSearchParams({
    ...queryObject,
    page: (page - 1).toString()
  }).toString()

  const mediaLanguages = languages
    .filter(
      (language) =>
        language.name[0]?.value != null ||
        language.fallbackName[0]?.value != null
    )
    .map((language) => ({
      languageId: Number(language.id),
      iso3: language.iso3 ?? '',
      bcp47: language.bcp47 ?? '',
      counts: {
        speakerCount: {
          value: language.countryLanguages
            .filter(({ suggested }) => !suggested)
            .reduce((acc, { speakers }) => acc + speakers, 0),
          description: 'Number of speakers'
        },
        countriesCount: {
          value: language.countryLanguages.filter(({ suggested }) => !suggested)
            .length,
          description: 'Number of countries'
        },
        ...(language.seriesCount != 0
          ? {
              series: {
                value: language.seriesCount,
                description: 'Series'
              }
            }
          : {}),
        ...(language.featureFilmCount != 0
          ? {
              featureFilm: {
                value: language.featureFilmCount,
                description: 'Feature Film'
              }
            }
          : {}),
        ...(language.shortFilmCount != 0
          ? {
              shortFilm: {
                value: language.shortFilmCount,
                description: 'Short Film'
              }
            }
          : {})
      },
      ...(language.audioPreview != null
        ? {
            audioPreview: {
              url: language.audioPreview.value,
              audioBitrate: language.audioPreview.bitrate,
              audioContainer: language.audioPreview.codec,
              sizeInBytes: language.audioPreview.size
            }
          }
        : {}),
      primaryCountryId:
        language.countryLanguages.find(({ primary }) => primary)?.country.id ??
        '',
      name: language.name[0]?.value ?? language.fallbackName[0]?.value ?? '',
      nameNative:
        language.nameNative.find(({ primary }) => primary)?.value ??
        language.name[0]?.value ??
        language.fallbackName[0]?.value ??
        '',
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
      _links: {
        self: {
          href: `http://api.arclight.org/v2/media-languages/${language.id}?apiKey=${apiKey}`
        }
      }
    }))

  const response = {
    page,
    limit,
    pages: totalPages,
    total: data.languagesCount,
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-languages?${queryString}`
      },
      first: {
        href: `http://api.arclight.org/v2/media-languages?${firstQueryString}`
      },
      last: {
        href: `http://api.arclight.org/v2/media-languages?${lastQueryString}`
      },
      ...(page < totalPages
        ? {
            next: {
              href: `http://api.arclight.org/v2/media-languages?${nextQueryString}`
            }
          }
        : {}),
      ...(page > 1
        ? {
            previous: {
              href: `http://api.arclight.org/v2/media-languages?${previousQueryString}`
            }
          }
        : {})
    },
    _embedded: {
      mediaLanguages
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
