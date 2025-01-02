import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { getLanguageIdsFromTags } from '../../../../lib/getLanguageIdsFromTags'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

const GET_LANGUAGE = graphql(`
  query GetLanguage(
    $id: ID!
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
  ) {
    language(id: $id, idType: databaseId) {
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

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof Response) {
    return languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const { data } = await getApolloClient().query<ResultOf<typeof GET_LANGUAGE>>(
    {
      query: GET_LANGUAGE,
      variables: {
        id: languageId,
        metadataLanguageId,
        fallbackLanguageId
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

  if (
    metadataLanguageTags.length > 0 &&
    language.name[0]?.value == null &&
    language.fallbackName[0]?.value == null
  ) {
    return new Response(
      JSON.stringify({
        message: `Unable to generate metadata for media language [${languageId}] acceptable according to metadata language(s) [${metadataLanguageTags.join(
          ','
        )}]`,
        logref: 406
      }),
      { status: 400 }
    )
  }
  const queryString = new URLSearchParams(queryObject).toString()

  const response = {
    languageId: Number(language.id),
    iso3: language.iso3,
    bcp47: language.bcp47,
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
      ...(language.seriesCount > 0 && {
        series: {
          value: language.seriesCount,
          description: 'Series'
        }
      }),
      ...(language.featureFilmCount > 0 && {
        featureFilm: {
          value: language.featureFilmCount,
          description: 'Feature Film'
        }
      }),
      ...(language.shortFilmCount > 0 && {
        shortFilm: {
          value: language.shortFilmCount,
          description: 'Short Film'
        }
      })
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
    primaryCountryId:
      language.countryLanguages.find(({ primary }) => primary)?.country.id ??
      '',
    name: language.name[0]?.value ?? language.fallbackName[0]?.value ?? '',
    nameNative: language.nameNative.find(({ primary }) => primary)?.value,
    alternateLanguageName: '',
    alternateLanguageNameNative: '',
    metadataLanguageTag: language.name[0]?.language.bcp47 ?? '',
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-languages/${languageId}?${queryString}`
      }
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
