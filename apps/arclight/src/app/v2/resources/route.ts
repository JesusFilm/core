import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'

/*
 * TODO: return values
 * TODO: query params
 * metadataLanguageTags,
 * bulk
 */

const GET_VIDEO = graphql(`
  query GetVideos($term: String!) {
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
      title {
        value
      }
      description {
        value
      }
      snippet {
        value
      }
      studyQuestions {
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
  query GetLanguagesWithTags($term: String, $limit: Int) {
    languagesCount(term: $term)
    languages(limit: $limit, term: $term) {
      id
      iso3
      bcp47
      name {
        value
        primary
      }
      primaryCountryId
    }
  }
`)

const GET_COUNTRIES = graphql(`
  query GetCountries($term: String!) {
    countries(term: $term) {
      id
      name {
        value
      }
      continent {
        name {
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
      term
    }
  })
  const languages = languagesData.languages

  const { data: videosData } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEO>
  >({
    query: GET_VIDEO,
    variables: {
      term
    }
  })
  const videos = videosData.videos

  const { data: countriesData } = await getApolloClient().query<
    ResultOf<typeof GET_COUNTRIES>
  >({
    query: GET_COUNTRIES,
    variables: {
      term
    }
  })
  const countries = countriesData.countries

  const transformedResponse = {
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
          name: country.name[0]?.value ?? '',
          continentName: country.continent.name[0]?.value ?? '',
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
          primaryCountryId: language.primaryCountryId,
          name: language.name.find(({ primary }) => !primary)?.value ?? '',
          nameNative: language.name.find(({ primary }) => primary)?.value ?? '',
          metadataLanguageTag: 'en',
          _links: {
            self: {
              href: `http://api.arclight.org/v2/media-languages/${language.id}?apiKey=${apiKey}`
            }
          }
        })),
        alternateLanguages: [],
        mediaComponents: videos.map((video) => ({
          mediaComponentId: video.id,
          componentType: video.variant?.hls != null ? 'content' : 'collection',
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
              video.images.find((image) => image.mobileCinematicVeryLow != null)
                ?.mobileCinematicVeryLow ?? ''
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
          title: video.title[0]?.value ?? '',
          shortDescription: video.snippet[0]?.value ?? '',
          longDescription: video.description[0]?.value ?? '',
          studyQuestions: video.studyQuestions.map(
            (question) => question.value
          ),
          metadataLanguageTag: 'en'
        }))
      }
    }
  }

  return new Response(JSON.stringify(transformedResponse), { status: 200 })
}
