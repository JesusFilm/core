import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { getLanguageIdsFromTags } from '../../../lib/getLanguageIdsFromTags'

const GET_VIDEO = graphql(`
  query GetVideos(
    $term: String!
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
  ) {
    videos(where: { title: $term }) {
      id
      label
      primaryLanguageId
      images {
        thumbnail
        videoStill
        mobileCinematicHigh
        mobileCinematicLow
        mobileCinematicVeryLow
      }
      title(languageId: $metadataLanguageId) {
        value
      }
      fallbackTitle: title(languageId: $fallbackLanguageId) {
        value
      }
      description(languageId: $metadataLanguageId) {
        value
      }
      fallbackDescription: description(languageId: $fallbackLanguageId) {
        value
      }
      snippet(languageId: $metadataLanguageId) {
        value
      }
      fallbackSnippet: snippet(languageId: $fallbackLanguageId) {
        value
      }
      studyQuestions(languageId: $metadataLanguageId) {
        value
      }
      fallbackStudyQuestions: studyQuestions(languageId: $fallbackLanguageId) {
        value
      }
      bibleCitations {
        osisId
        chapterStart
        verseStart
        chapterEnd
        verseEnd
      }
      childrenCount
      variantLanguages {
        id
      }
      variant {
        hls
        duration
        language {
          bcp47
        }
        downloadable
        downloads {
          height
          width
          quality
          size
        }
      }
    }
  }
`)

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
      primaryCountryId
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

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams
  const apiKey = query.get('apiKey') ?? ''
  const term = query.get('term') ?? ''
  const bulk = query.get('bulk') ?? 'false'
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',') ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof Response) {
    return languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

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

  const { data: languagesData } = await getApolloClient().query<
    ResultOf<typeof GET_LANGUAGES>
  >({
    query: GET_LANGUAGES,
    variables: {
      term,
      metadataLanguageId,
      fallbackLanguageId
    }
  })
  const languages = languagesData.languages.filter(
    (language) =>
      language.name[0]?.value != null || language.fallbackName[0]?.value != null
  )

  const { data: videosData } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEO>
  >({
    query: GET_VIDEO,
    variables: {
      term,
      metadataLanguageId,
      fallbackLanguageId
    }
  })
  const videos = videosData.videos.filter(
    (video) =>
      video.title[0]?.value != null || video.fallbackTitle[0]?.value != null
  )

  const { data: countriesData } = await getApolloClient().query<
    ResultOf<typeof GET_COUNTRIES>
  >({
    query: GET_COUNTRIES,
    variables: {
      term,
      metadataLanguageId,
      fallbackLanguageId
    }
  })
  const countries = countriesData.countries.filter(
    (country) =>
      country.name[0]?.value != null || country.fallbackName[0]?.value != null
  )

  let transformedResponse
  if (bulk === 'true') {
    transformedResponse = {
      _links: {
        self: {
          href: `http://api.arclight.org/v2/resources?term=${term}&bulk=false&apiKey=${apiKey}`
        }
      },
      _embedded: {
        resources: {
          resourceCount: videos.length + countries.length + languages.length,
          mediaCountries: countries.map((country) => country.id),
          mediaLanguages: languages.map((language) => Number(language.id)),
          alternateLanguages: [],
          mediaComponents: videos.map((video) => video.id)
        }
      }
    }
  } else {
    transformedResponse = {
      _links: {
        self: {
          href: `http://api.arclight.org/v2/resources?term=${term}&bulk=false&apiKey=${apiKey}`
        }
      },
      _embedded: {
        resources: {
          resourceCount: videos.length + countries.length + languages.length,
          mediaCountries: countries.map((country) => ({
            countryId: country.id,
            name:
              country.name[0]?.value ?? country.fallbackName[0]?.value ?? '',
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
              language.name[0]?.value ?? language.fallbackName[0]?.value ?? '',
            nameNative:
              (
                language.name.find(({ primary }) => primary) ??
                language.fallbackName.find(({ primary }) => primary)
              )?.value ?? '',
            metadataLanguageTag:
              language.name[0]?.value != null
                ? metadataLanguageTags[0]
                : (metadataLanguageTags[1] ?? 'en'),
            _links: {
              self: {
                href: `http://api.arclight.org/v2/media-languages/${language.id}?apiKey=${apiKey}`
              }
            }
          })),
          alternateLanguages: [],
          mediaComponents: videos.map((video) => ({
            mediaComponentId: video.id,
            componentType:
              video.variant?.hls != null ? 'content' : 'collection',
            contentType: 'video',
            subType: video.label,
            imageUrls: {
              thumbnail:
                video.images.find((image) => image.thumbnail != null)
                  ?.thumbnail ?? '',
              videoStill:
                video.images.find((image) => image.videoStill != null)
                  ?.videoStill ?? '',
              mobileCinematicHigh:
                video.images.find((image) => image.mobileCinematicHigh != null)
                  ?.mobileCinematicHigh ?? '',
              mobileCinematicLow:
                video.images.find((image) => image.mobileCinematicLow != null)
                  ?.mobileCinematicLow ?? '',
              mobileCinematicVeryLow:
                video.images.find(
                  (image) => image.mobileCinematicVeryLow != null
                )?.mobileCinematicVeryLow ?? ''
            },
            lengthInMilliseconds: (video?.variant?.duration ?? 0) * 1000,
            containsCount: video.childrenCount ?? 0,
            isDownloadable: true,
            downloadSizes: {},
            bibleCitations: video.bibleCitations.map((citation) => ({
              osisBibleBook: citation.osisId,
              chapterStart: citation.chapterStart,
              verseStart: citation.verseStart,
              chapterEnd: citation.chapterEnd,
              verseEnd: citation.verseEnd
            })),
            primaryLanguageId: Number(video.primaryLanguageId),
            title: video.title[0]?.value ?? video.fallbackTitle[0]?.value ?? '',
            shortDescription:
              video.snippet[0]?.value ?? video.fallbackSnippet[0]?.value ?? '',
            longDescription:
              video.description[0]?.value ??
              video.fallbackDescription[0]?.value ??
              '',
            studyQuestions: (video.studyQuestions.length > 0
              ? video.studyQuestions
              : video.fallbackStudyQuestions
            ).map((question) => question.value),
            metadataLanguageTag:
              video.title[0]?.value != null
                ? metadataLanguageTags[0]
                : (metadataLanguageTags[1] ?? 'en')
          }))
        }
      }
    }
  }

  return new Response(JSON.stringify(transformedResponse), { status: 200 })
}
