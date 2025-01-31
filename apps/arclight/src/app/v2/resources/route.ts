import { algoliasearch } from 'algoliasearch'
import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { getLanguageIdsFromTags } from '../../../lib/getLanguageIdsFromTags'

const GET_LANGUAGES = graphql(`
  query GetLanguagesWithTags(
    $term: String
    $limit: Int
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
  ) {
    languagesCount(term: $term)
    languages(limit: $limit, term: $term) {
      id
      iso3
      bcp47
      name(languageId: $metadataLanguageId) {
        value
        primary
      }
      fallbackName: name(languageId: $fallbackLanguageId) {
        value
        primary
      }
      countryLanguages {
        id
        country {
          id
        }
        primary
      }
    }
  }
`)

const GET_COUNTRIES = graphql(`
  query GetCountries(
    $term: String!
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
  ) {
    countries(term: $term) {
      id
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
      longitude
      latitude
    }
  }
`)

type AlgoliaHit = {
  videoId?: string
  label?: string
  image?: string
  duration?: number
  childrenCount?: number
  languageId?: string
  titles?: string[]
  description?: string[]
  _highlightResult?: {
    titles?: { value: string; matchedWords: string[] }[]
    description?: { value: string; matchedWords: string[] }[]
  }
}

async function searchAlgolia(term: string) {
  const appID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_VIDEO_VARIANTS
  if (!appID || !apiKey || !indexName) {
    throw new Error('Algolia environment variables are not set')
  }
  const client = algoliasearch(appID, apiKey)

  const { results } = await client.searchSingleIndex<AlgoliaHit>(
    {
      indexName,
      searchParams: {
        query: term,
        filters: `languageId:529`
      }
    },
    {
      queryParameters: {
        highlightPreTag: '<>',
        highlightPostTag: '<>'
      }
    }
  )

  if (!results[0] || !('hits' in results[0])) {
    throw new Error('Unexpected Algolia response format')
  }

  return results[0].hits
}

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams
  const apiKey = query.get('apiKey') ?? ''
  const term = query.get('term') ?? ''
  const bulk = query.get('bulk') ?? 'false'
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',') ?? []

  if (term === '') {
    return new Response(
      JSON.stringify({
        message:
          'Parameter "term" of value "" violated a constraint. This value should not be empty.',
        logref: 400
      }),
      { status: 400 }
    )
  }

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof Response) {
    return languageResult
  }
  const { metadataLanguageId, fallbackLanguageId } = languageResult

  try {
    const [{ data: languagesData }, { data: countriesData }, algoliaHits] =
      await Promise.all([
        getApolloClient().query<ResultOf<typeof GET_LANGUAGES>>({
          query: GET_LANGUAGES,
          variables: { term, metadataLanguageId, fallbackLanguageId }
        }),
        getApolloClient().query<ResultOf<typeof GET_COUNTRIES>>({
          query: GET_COUNTRIES,
          variables: { term, metadataLanguageId, fallbackLanguageId }
        }),
        searchAlgolia(term)
      ])

    const languages = languagesData.languages.filter(
      (language) =>
        language.name[0]?.value != null ||
        language.fallbackName[0]?.value != null
    )
    const countries = countriesData.countries.filter(
      (country) =>
        country.name[0]?.value != null || country.fallbackName[0]?.value != null
    )

    const transformedVideos = algoliaHits.map((hit: AlgoliaHit) => ({
      mediaComponentId: hit.videoId ?? 'defaultVideoId',
      componentType: hit.label === 'shortFilm' ? 'content' : 'container',
      subType: hit.label,
      contentType: 'video',
      imageUrls: {
        thumbnail: hit.image,
        videoStill: hit.image,
        mobileCinematicHigh: hit.image,
        mobileCinematicLow: hit.image,
        mobileCinematicVeryLow: hit.image
      },
      lengthInMilliseconds: (hit.duration ?? 0) * 1000,
      containsCount: hit.childrenCount ?? 0,
      isDownloadable: true,
      downloadSizes: {},
      bibleCitations: [],
      primaryLanguageId: parseInt(hit.languageId ?? '0'),
      title: hit.titles?.[0] ?? '',
      shortDescription: hit.description?.[0] ?? '',
      longDescription: hit.description?.[0] ?? '',
      studyQuestions: [],
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en'
    }))

    const transformedResponse =
      bulk === 'true'
        ? {
            _links: {
              self: {
                href: `http://api.arclight.org/v2/resources?term=${term}&bulk=false&apiKey=${apiKey}`
              }
            },
            _embedded: {
              resources: {
                resourceCount:
                  transformedVideos.length +
                  countries.length +
                  languages.length,
                mediaCountries: countries.map((country) => country.id),
                mediaLanguages: languages.map((language) =>
                  Number(language.id)
                ),
                alternateLanguages: [],
                mediaComponents: transformedVideos.map(
                  (video: { mediaComponentId: string }) =>
                    video.mediaComponentId
                )
              }
            }
          }
        : {
            _links: {
              self: {
                href: `http://api.arclight.org/v2/resources?term=${term}&bulk=false&apiKey=${apiKey}`
              }
            },
            _embedded: {
              resources: {
                resourceCount:
                  transformedVideos.length +
                  countries.length +
                  languages.length,
                mediaCountries: countries.map((country) => ({
                  countryId: country.id,
                  name:
                    country.name[0]?.value ??
                    country.fallbackName[0]?.value ??
                    '',
                  continentName:
                    country.continent.name[0]?.value ??
                    country.continent.fallbackName[0]?.value ??
                    '',
                  metadataLanguageTag: 'en',
                  longitude: country.longitude,
                  latitude: country.latitude,
                  _links: {
                    self: {
                      href: `http://api.arclight.org/v2/media-countries/${country.id}?apiKey=${apiKey}`
                    }
                  }
                })),
                mediaLanguages: languages.map((language) => ({
                  languageId: Number(language.id),
                  iso3: language.iso3,
                  bcp47: language.bcp47,
                  primaryCountryId:
                    language.countryLanguages.find(({ primary }) => primary)
                      ?.country.id ?? '',
                  name:
                    language.name[0]?.value ??
                    language.fallbackName[0]?.value ??
                    '',
                  nameNative:
                    (
                      language.name.find(({ primary }) => primary) ??
                      language.fallbackName.find(({ primary }) => primary)
                    )?.value ?? '',
                  metadataLanguageTag: 'en',
                  _links: {
                    self: {
                      href: `http://api.arclight.org/v2/media-languages/${language.id}?apiKey=${apiKey}`
                    }
                  }
                })),
                alternateLanguages: [],
                mediaComponents: transformedVideos
              }
            }
          }

    return new Response(JSON.stringify(transformedResponse), { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: `Internal server error: ${String(error)}`,
        logref: 500
      }),
      { status: 500 }
    )
  }
}
