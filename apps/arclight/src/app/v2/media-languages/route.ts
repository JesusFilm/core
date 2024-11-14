import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

const GET_LANGUAGES = graphql(`
  query GetLanguagesWithTags(
    $limit: Int!
    $offset: Int!
    $ids: [ID!]
    $bcp47: [String!]
    $iso3: [String!]
    $languageId: ID
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
      name(languageId: $languageId) {
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
      speakerCount
      countriesCount
      primaryCountryId
      seriesCount
      featureFilmCount
      shortFilmCount
    }
  }
`)

const GET_LANGUAGE_ID_FROM_BCP47 = graphql(`
  query GetLanguageIdFromBCP47($bcp47: ID!) {
    language(id: $bcp47, idType: bcp47) {
      id
    }
  }
`)

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams

  const page = Number(query.get('page') ?? 1)
  const limit = Number(query.get('limit') ?? 10)
  const offset = (page - 1) * limit
  const bcp47 = query.get('bcp47')?.split(',')
  const ids = query.get('ids')?.split(',')
  const iso3 = query.get('iso3')?.split(',')
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',') ?? []
  const term = query.get('term')

  let languageId = '529'
  let fallbackLanguageId = ''
  if (metadataLanguageTags.length > 0) {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[0] }
    })

    if (data.language == null) {
      const metadataTagsString = metadataLanguageTags.join(', ')
      return new Response(
        JSON.stringify({
          message: `Parameter "metadataLanguageTags" of value "${metadataTagsString}" violated a constraint "Not acceptable metadata language tag(s): ${metadataTagsString}"`,
          logref: 400
        }),
        { status: 400 }
      )
    }

    languageId = data.language?.id
  }
  if (metadataLanguageTags.length > 1) {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[1] }
    })
    fallbackLanguageId = data.language?.id ?? ''
  }

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
      languageId,
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

  const mediaLanguages = languages.map((language) => ({
    languageId: Number(language.id),
    iso3: language.iso3,
    bcp47: language.bcp47,
    counts: {
      speakerCount: {
        value: language.speakerCount,
        description: 'Number of speakers'
      },
      countriesCount: {
        value: language.countriesCount,
        description: 'Number of countries'
      },
      series: {
        value: language.seriesCount,
        description: 'Series'
      },
      featureFilm: {
        value: language.featureFilmCount,
        description: 'Feature Film'
      },
      shortFilm: {
        value: language.shortFilmCount,
        description: 'Short Film'
      }
    },
    audioPreview:
      language.audioPreview != null
        ? {
            url: language.audioPreview.value,
            audioBitrate: language.audioPreview.bitrate,
            audioContainer: language.audioPreview.codec,
            sizeInBytes: language.audioPreview.size
          }
        : null,
    primaryCountryId: language.primaryCountryId ?? '',
    name: language.name[0]?.value ?? language.fallbackName[0]?.value ?? '',
    nameNative: language.nameNative.find(({ primary }) => primary)?.value,
    alternateLanguageName: '',
    alternateLanguageNameNative: '',
    metadataLanguageTag: language.name[0]?.language.bcp47 ?? '',
    _links: {
      self: {
        href: `/v2/media-languages/${language.id}`
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
