import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

interface MediaCountryResponse {
  countryId: string
  name: string
  continentName: string
  metadataLanguageTag: string
  longitude: number | null
  latitude: number | null
  counts: {
    languageCount: { value: number | null; description: string }
    population: { value: number | null; description: string }
    languageHavingMediaCount: { value: number | null; description: string }
  }
  assets: {
    flagUrls: { png8: string | null; webpLossy50: string | null }
  }
  _links: {
    self: { href: string }
  }
  _embedded?: {
    mediaLanguages: Array<{
      languageId: string
      iso3: string | null
      bcp47: string | null
      counts: {
        countrySpeakerCount: { value: number | null; description: string }
      }
      primaryCountryId: string | null
      name: string | undefined
      nameNative: string | undefined
      alternateLanguageName: string
      alternateLanguageNameNative: string
      metadataLanguageTag: string
    }>
  }
}

const GET_LANGUAGE_ID_FROM_BCP47 = graphql(`
  query GetLanguageIdFromBCP47($bcp47: ID!) {
    language(id: $bcp47, idType: bcp47) {
      id
    }
  }
`)

const GET_COUNTRY = graphql(`
  query GetCountry($id: ID!, $languageId: ID!, $fallbackLanguageId: ID!) {
    country(id: $id) {
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
        displaySpeakers
        language {
          id
          iso3
          bcp47
          primaryCountryId
          name {
            value
            primary
          }
        }
      }
      languageCount
      languageHavingMediaCount
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
  const expand = query.get('expand')
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

  const { data } = await getApolloClient().query<ResultOf<typeof GET_COUNTRY>>({
    query: GET_COUNTRY,
    variables: {
      id: countryId,
      languageId,
      fallbackLanguageId
    }
  })
  const country = data.country

  if (country == null) {
    return new Response(
      JSON.stringify({
        message: `${countryId}:\n  The requested country ID '${countryId}' not found.\n`,
        logref: 404
      }),
      { status: 404 }
    )
  }

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()

  const response: MediaCountryResponse = {
    countryId,
    name: country.name?.[0]?.value ?? country.fallbackName?.[0]?.value ?? '',
    continentName:
      country.continent?.name?.[0]?.value ??
      country.continent?.fallbackName?.[0]?.value ??
      '',
    metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
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
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-countries/${countryId}?${queryString}`
      }
    }
  }

  if (expand === 'mediaLanguages') {
    response._embedded = {
      mediaLanguages: country.countryLanguages.map((countryLanguage) => ({
        languageId: countryLanguage.language.id,
        iso3: countryLanguage.language.iso3,
        bcp47: countryLanguage.language.bcp47,
        counts: {
          countrySpeakerCount: {
            value: countryLanguage.displaySpeakers,
            description: 'Number of language speakers in country'
          }
        },
        primaryCountryId: countryLanguage.language.primaryCountryId,
        name: countryLanguage.language.name.find(({ primary }) => !primary)
          ?.value,
        nameNative: countryLanguage.language.name.find(({ primary }) => primary)
          ?.value,
        alternateLanguageName: '',
        alternateLanguageNameNative: '',
        metadataLanguageTag: 'en'
      }))
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
