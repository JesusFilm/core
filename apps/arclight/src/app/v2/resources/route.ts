import { SearchClient, algoliasearch } from 'algoliasearch'
import { NextRequest } from 'next/server'

type AlgoliaVideoHit = {
  mediaComponentId: string
  componentType: string
  subType?: string
  contentType: string
  lengthInMilliseconds?: number
  imageUrls: {
    thumbnail?: string
    videoStill?: string
    mobileCinematicHigh?: string
    mobileCinematicLow?: string
    mobileCinematicVeryLow?: string
  }
  titles: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  descriptions: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  studyQuestions: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  isDownloadable: boolean
  downloadSizes: {
    approximateSmallDownloadSizeInBytes?: number
    approximateLargeDownloadSizeInBytes?: number
  }
  primaryLanguageId: number
  bibleCitations: Array<any>
  containsCount: number
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

type AlgoliaCountryHit = {
  objectID: string
  countryId: string
  names: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  continentName: string
  longitude: number
  latitude: number
}

async function initAlgoliaClient() {
  const appID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY

  if (!appID || !apiKey) {
    throw new Error('Algolia environment variables are not set')
  }

  return algoliasearch(appID, apiKey)
}

async function searchVideoVariantsAlgolia(
  term: string,
  metadataLanguageTags: string[],
  client: SearchClient
) {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS
  if (!indexName) {
    throw new Error('Algolia environment variables are not set')
  }

  const response = await client.searchSingleIndex<AlgoliaVideoHit>({
    indexName,
    searchParams: {
      query: term,
      hitsPerPage: 1000
    }
  })

  if (!response.hits) {
    return []
  }

  return response.hits.map((hit) => ({
    mediaComponentId: hit.mediaComponentId,
    componentType: hit.componentType,
    subType: hit.subType,
    contentType: hit.contentType,
    imageUrls: {
      thumbnail: hit.imageUrls.thumbnail,
      videoStill: hit.imageUrls.videoStill,
      mobileCinematicHigh: hit.imageUrls.mobileCinematicHigh,
      mobileCinematicLow: hit.imageUrls.mobileCinematicLow,
      mobileCinematicVeryLow: hit.imageUrls.mobileCinematicVeryLow
    },
    lengthInMilliseconds: hit.lengthInMilliseconds ?? 0,
    containsCount: hit.containsCount,
    isDownloadable: hit.isDownloadable,
    downloadSizes: hit.downloadSizes ?? {},
    bibleCitations: hit.bibleCitations ?? [],
    primaryLanguageId: hit.primaryLanguageId,
    title:
      hit.titles.find((t) => t.bcp47 === metadataLanguageTags[0])?.value ??
      hit.titles.find((t) => t.bcp47 === 'en')?.value ??
      '',
    shortDescription:
      hit.descriptions.find((d) => d.bcp47 === metadataLanguageTags[0])
        ?.value ??
      hit.descriptions.find((d) => d.bcp47 === 'en')?.value ??
      '',
    longDescription:
      hit.descriptions.find((d) => d.bcp47 === metadataLanguageTags[0])
        ?.value ??
      hit.descriptions.find((d) => d.bcp47 === 'en')?.value ??
      '',
    studyQuestions:
      hit.studyQuestions.find((q) => q.bcp47 === metadataLanguageTags[0])
        ?.value ??
      hit.studyQuestions.find((q) => q.bcp47 === 'en')?.value ??
      '',
    metadataLanguageTag: metadataLanguageTags[0]
  }))
}

async function searchAlgoliaLanguages(
  term: string,
  metadataLanguageTags: string[],
  client: SearchClient
) {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_LANGUAGES
  if (!indexName) {
    throw new Error('Algolia environment variables are not set')
  }

  const facets = []
  for (const tag of metadataLanguageTags) {
    facets.push(`names.bcp47:${tag}`)
  }

  const response = await client.searchSingleIndex<AlgoliaLanguageHit>({
    indexName,
    searchParams: {
      query: term,
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
  })

  if (!response.hits) {
    return []
  }

  return response.hits.map((hit) => ({
    objectID: hit.objectID,
    iso3: hit.iso3,
    bcp47: hit.bcp47,
    primaryCountryId: hit.primaryCountryId,
    nameNative: hit.nameNative,
    names: hit.names
  }))
}

async function searchAlgoliaCountries(
  term: string,
  metadataLanguageTags: string[],
  client: SearchClient
) {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_COUNTRIES
  if (!indexName) {
    throw new Error('Algolia environment variables are not set')
  }

  const facets = []
  for (const tag of metadataLanguageTags) {
    facets.push(`names.bcp47:${tag}`)
  }

  const response = await client.searchSingleIndex<AlgoliaCountryHit>({
    indexName,
    searchParams: {
      query: term,
      hitsPerPage: 1000,
      facets: metadataLanguageTags.length > 0 ? ['names.bcp47'] : [],
      ...(metadataLanguageTags.length > 0 && {
        facetFilters: facets
      })
    }
  })

  return response.hits ?? []
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
    const client = await initAlgoliaClient()

    const [videoHits, languageHits, countryHits] = await Promise.all([
      searchVideoVariantsAlgolia(term, metadataLanguageTags, client),
      searchAlgoliaLanguages(term, metadataLanguageTags, client),
      searchAlgoliaCountries(term, metadataLanguageTags, client)
    ])

    const transformedVideos = videoHits.map((hit) => ({
      mediaComponentId: hit.mediaComponentId,
      componentType: hit.componentType,
      subType: hit.subType,
      contentType: hit.contentType,
      imageUrls: {
        thumbnail: hit.imageUrls.thumbnail,
        videoStill: hit.imageUrls.videoStill,
        mobileCinematicHigh: hit.imageUrls.mobileCinematicHigh,
        mobileCinematicLow: hit.imageUrls.mobileCinematicLow,
        mobileCinematicVeryLow: hit.imageUrls.mobileCinematicVeryLow
      },
      lengthInMilliseconds: hit.lengthInMilliseconds ?? 0,
      containsCount: hit.containsCount,
      isDownloadable: hit.isDownloadable,
      downloadSizes: hit.downloadSizes ?? {},
      bibleCitations: hit.bibleCitations ?? [],
      primaryLanguageId: hit.primaryLanguageId,
      title: hit.title,
      shortDescription: hit.shortDescription,
      longDescription: hit.longDescription,
      studyQuestions: hit.studyQuestions,
      metadataLanguageTag: metadataLanguageTags[0]
    }))

    const transformedLanguages = languageHits.map((hit) => ({
      languageId: Number(hit.objectID),
      iso3: hit.iso3,
      bcp47: hit.bcp47,
      primaryCountryId: hit.primaryCountryId,
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
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
      __links: {
        self: {
          href: `http://api.arclight.org/v2/media-languages/${hit.objectID}?apiKey=${apiKey}`
        }
      }
    }))

    const transformedCountries = countryHits.map((hit) => ({
      countryId: hit.countryId,
      name:
        hit.names.find((n) => n.bcp47 === metadataLanguageTags[0])?.value ??
        hit.names.find((n) => n.bcp47 === 'en')?.value ??
        '',
      continentName: hit.continentName,
      longitude: hit.longitude,
      latitude: hit.latitude,
      __links: {
        self: {
          href: `http://api.arclight.org/v2/media-countries/${hit.countryId}?apiKey=${apiKey}`
        }
      }
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
                  countryHits.length +
                  transformedLanguages.length,
                mediaCountries: countryHits.map((country) => country.countryId),
                mediaLanguages: transformedLanguages.map((language) =>
                  Number(language.languageId)
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
                  countryHits.length +
                  transformedLanguages.length,
                mediaCountries: transformedCountries,
                mediaLanguages: transformedLanguages,
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
