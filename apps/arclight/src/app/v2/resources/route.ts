import algoliasearch from 'algoliasearch'
import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'

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

type AlgoliaLanguageHit = {
  objectID: string
  languageId: number
  iso3: string
  bcp47: string
  primaryCountryId: string
  nameNative: string
  names: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  speakersCount: number
}

async function searchAlgolia(term: string) {
  const appID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_VIDEO_VARIANTS
  if (!appID || !apiKey || !indexName) {
    throw new Error('Algolia environment variables are not set')
  }
  const client = algoliasearch(appID, apiKey)

  const { results } = await client.search<AlgoliaHit>([
    {
      indexName,
      query: term,
      params: {
        filters: `languageId:529`,
        highlightPreTag: '<>',
        highlightPostTag: '<>'
      }
    }
  ])

  if (!results[0] || !('hits' in results[0])) {
    throw new Error('Unexpected Algolia response format')
  }

  return results[0].hits
}

async function searchAlgoliaLanguages(
  term: string,
  metadataLanguageTags: string[]
) {
  const appID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_LANGUAGES

  if (!appID || !apiKey || !indexName) {
    throw new Error('Algolia environment variables are not set')
  }
  const client = algoliasearch(appID, apiKey)
  const index = client.initIndex(indexName)

  const facets = []
  for (const tag of metadataLanguageTags) {
    facets.push(`names.bcp47:${tag}`)
  }

  const searchParams = {
    hitsPerPage: 1000,
    facets: metadataLanguageTags.length > 0 ? ['names.bcp47'] : [],
    ...(metadataLanguageTags.length > 0 && {
      facetFilters: facets
    }),
    maxValuesPerFacet: 100,
    attributesToRetrieve: [
      'objectID',
      'languageId',
      'iso3',
      'bcp47',
      'primaryCountryId',
      'nameNative',
      'names',
      'speakersCount'
    ]
  }

  const { hits } = await index.search<AlgoliaLanguageHit>(term, searchParams)

  return hits.map((hit) => ({
    id: hit.objectID,
    iso3: hit.iso3,
    bcp47: hit.bcp47,
    nameNative:
      hit.nameNative ?? hit.names.find((n) => n.bcp47 === 'en')?.value ?? '',
    name: [
      {
        value:
          hit.names.find((n) => n.bcp47 === metadataLanguageTags[0])?.value ??
          hit.names.find((n) => n.bcp47 === 'en')?.value ??
          '',
        bcp47: hit.bcp47
      }
    ],
    primaryCountryId: hit.primaryCountryId
  }))
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

  try {
    const [algoliaHits, languages, { data: countriesData }] = await Promise.all(
      [
        searchAlgolia(term),
        searchAlgoliaLanguages(term, metadataLanguageTags),
        getApolloClient().query<ResultOf<typeof GET_COUNTRIES>>({
          query: GET_COUNTRIES,
          variables: { term, metadataLanguageTags, fallbackLanguageId: 'en' }
        })
      ]
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
      metadataLanguageTag: metadataLanguageTags[0]
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
                  (video) => video.mediaComponentId
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
                  metadataLanguageTag:
                    country.name[0]?.value != null
                      ? metadataLanguageTags[0]
                      : (metadataLanguageTags[1] ?? 'en'),
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
                  primaryCountryId: language.primaryCountryId,
                  name:
                    language.name.find(
                      (n: { value: string | undefined; bcp47?: string }) =>
                        n.bcp47 === metadataLanguageTags[0]
                    )?.value ??
                    language.name[0]?.value ??
                    language.nameNative,
                  nameNative: language.nameNative ?? '',
                  metadataLanguageTag: metadataLanguageTags[0],
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
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'ApiError') {
        console.error('Algolia API Error:', error)
        return new Response(
          JSON.stringify({
            message: `Algolia API Error: ${(error as { message?: string }).message ?? 'Unknown error'}`,
            logref: 403
          }),
          { status: 403 }
        )
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'

    console.error('Resources API Error:', error)

    return new Response(
      JSON.stringify({
        message: `Internal server error: ${errorMessage}`,
        logref: 500
      }),
      { status: 500 }
    )
  }
}
