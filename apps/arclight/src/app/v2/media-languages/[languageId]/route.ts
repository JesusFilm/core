import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

const GET_LANGUAGE = graphql(`
  query GetLanguage($id: ID!, $languageId: ID, $fallbackLanguageId: ID) {
    language(id: $id, idType: databaseId) {
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

interface GetParams {
  params: { languageId: string }
}

export async function GET(
  request: NextRequest,
  { params }: GetParams
): Promise<Response> {
  const query = request.nextUrl.searchParams
  const { languageId } = params
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',') ?? []

  let metadataLanguageId = '529'
  let fallbackLanguageId = ''

  if (metadataLanguageTags.length > 0) {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[0] }
    })

    if (data.language == null) {
      return new Response(
        JSON.stringify({
          message: `Parameter "metadataLanguageTags" of value "${metadataLanguageTags}" violated a constraint "Not acceptable metadata language tag(s): ${metadataLanguageTags}"`,
          logref: 400
        }),
        { status: 400 }
      )
    }

    metadataLanguageId = data.language?.id
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

  const { data } = await getApolloClient().query<ResultOf<typeof GET_LANGUAGE>>(
    {
      query: GET_LANGUAGE,
      variables: {
        id: languageId
      }
    }
  )
  const language = data.language

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  if (language == null)
    return new Response(
      JSON.stringify({
        message: `${languageId}:\n  The requested language ID '${languageId}'not found.\n`,
        logref: 404
      }),
      { status: 404 }
    )

  const queryString = new URLSearchParams(queryObject).toString()

  const response = {
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
    metadataLanguageTag: 'en',
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-languages/${languageId}?${queryString}`
      }
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
