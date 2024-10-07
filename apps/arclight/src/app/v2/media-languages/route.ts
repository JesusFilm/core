import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
querystring:
  apiKey
  term
    iso3
    bcp47
    ids
    countryIds
type
    subTypes
    contentTypes
    expand
    filter
*/
const GET_LANGUAGES = graphql(`
query GetLanguagesWithTags {
  languages {
    id
    iso3
    bcp47
    name {
      value
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
  languagesCount
}
`)

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams

  const page = Number(query.get('page') ?? 1)
  const limit = Number(query.get('limit') ?? 10)
  const offset = (page - 1) * limit

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_LANGUAGES>
  >({
    query: GET_LANGUAGES,
    variables: {
      limit,
      offset
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
  // TODO: Needs new query in gql
  const lastQueryString = new URLSearchParams({
    ...queryObject,
    page: '1192'
  }).toString()
  const nextQueryString = new URLSearchParams({
    ...queryObject,
    page: (page + 1).toString()
  }).toString()

  const mediaLanguages = data.languages.map((language) => ({
    languageId: Number(language.id),
    iso3: language.iso3,
    bcp47: language.bcp47,
    counts: {
      speakerCount: {
        value: language.speakerCount,
        description: "Number of speakers"
      },
      countriesCount: {
        value: language.countriesCount,
        description: "Number of countries"
      },
      series: {
        value: language.seriesCount,
        description: "Series"
      },
      featureFilm: {
        value: language.featureFilmCount,
        description: "Feature Film"
      },
      shortFilm: {
        value: language.shortFilmCount,
        description: "Short Film"
      }
    },
    audioPreview: language.audioPreview != null ? {
      url: language.audioPreview.value,
      audioBitrate: language.audioPreview.bitrate,
      audioContainer: language.audioPreview.codec,
      sizeInBytes: language.audioPreview.size
    } : null,
    primaryCountryId: language.primaryCountryId ?? '',
    name: language.name[0]?.value,
    nameNative: language.name[1]?.value,
    alternateLanguageName:  '',
    alternateLanguageNameNative: '',
    metadataLanguageTag: 'en', // TODO: Get from parameters
    _links: {
      self: {
        // TODO queerystring
        href: `/v2/media-languages/${language.id}`
      }
    }
  }))

  const response = {
    page,
    limit,
    pages: Math.ceil(Number(data.languagesCount) / limit),
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
      next: {
        href: `http://api.arclight.org/v2/media-languages?${nextQueryString}`
      }
    },
    _embedded: {
      mediaLanguages
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
