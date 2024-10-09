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
*/

const GET_LANGUAGE = graphql(`
  query GetLanguage($id: ID!) {
    language(id: $id, idType: databaseId) {
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
  }
`)

interface GetParams {
  params: { languageId: string }
}

export async function GET(
  request: NextRequest,
  { params }: GetParams
): Promise<Response> {
  const query = request.nextUrl.searchParams
  const { languageId } = params

  const { data } = await getApolloClient().query<ResultOf<typeof GET_LANGUAGE>>(
    {
      query: GET_LANGUAGE,
      variables: {
        id: languageId
      }
    }
  )

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  if (data.language == null)
    return new Response(
      JSON.stringify({
        message: `${languageId}:\n  The requested language ID '${languageId}'not found.\n`,
        logref: 404
      }),
      { status: 404 }
    )

  const queryString = new URLSearchParams(queryObject).toString()

  const response = {
    languageId: Number(data.language.id),
    iso3: data.language.iso3,
    bcp47: data.language.bcp47,
    counts: {
      speakerCount: {
        value: data.language.speakerCount,
        description: 'Number of speakers'
      },
      countriesCount: {
        value: data.language.countriesCount,
        description: 'Number of countries'
      },
      series: {
        value: data.language.seriesCount,
        description: 'Series'
      },
      featureFilm: {
        value: data.language.featureFilmCount,
        description: 'Feature Film'
      },
      shortFilm: {
        value: data.language.shortFilmCount,
        description: 'Short Film'
      }
    },
    audioPreview:
      data.language.audioPreview != null
        ? {
            url: data.language.audioPreview.value,
            audioBitrate: data.language.audioPreview.bitrate,
            audioContainer: data.language.audioPreview.codec,
            sizeInBytes: data.language.audioPreview.size
          }
        : null,
    primaryCountryId: data.language.primaryCountryId ?? '',
    name: data.language.name[0].value,
    nameNative: data.language.name[1]?.value ?? data.language.name[0].value,
    alternateLanguageName: '',
    alternateLanguageNameNative: '',
    metadataLanguageTag: 'en',
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-languages/${languageId}?${queryString}`
      }
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
