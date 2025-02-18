import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { generateETag } from '../../../lib/etag'
import { getLanguageIdsFromTags } from '../../../lib/getLanguageIdsFromTags'
import { paramsToRecord } from '../../../lib/paramsToRecord'

const GET_VIDEOS_WITH_FALLBACK = graphql(`
  query GetVideosWithFallback(
    $limit: Int
    $offset: Int
    $ids: [ID!]
    $languageIds: [ID!]
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
    $labels: [VideoLabel!]
  ) {
    videosCount(
      where: {
        ids: $ids
        availableVariantLanguageIds: $languageIds
        labels: $labels
      }
    )
    videos(
      limit: $limit
      offset: $offset
      where: {
        ids: $ids
        availableVariantLanguageIds: $languageIds
        labels: $labels
      }
    ) {
      id
      label
      images {
        thumbnail
        videoStill
        mobileCinematicHigh
        mobileCinematicLow
        mobileCinematicVeryLow
      }
      primaryLanguageId
      title(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackTitle: title(languageId: $fallbackLanguageId) {
        value
      }
      description(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackDescription: description(languageId: $fallbackLanguageId) {
        value
      }
      snippet(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackSnippet: snippet(languageId: $fallbackLanguageId) {
        value
      }
      studyQuestions(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
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
      availableLanguages
      variant {
        hls
        duration
        lengthInMilliseconds
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

export const maxDuration = 60

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams

  const page = Number(query.get('page')) === 0 ? 1 : Number(query.get('page'))
  const limit =
    Number(query.get('limit')) === 0 ? 10000 : Number(query.get('limit'))
  const offset = (page - 1) * limit
  const expand = query.get('expand') ?? ''
  const subTypes =
    query.get('subTypes')?.split(',').filter(Boolean).length === 0
      ? undefined
      : query.get('subTypes')?.split(',').filter(Boolean)
  const languageIds =
    query.get('languageIds')?.split(',').filter(Boolean).length === 0
      ? undefined
      : query.get('languageIds')?.split(',').filter(Boolean)
  const ids =
    query.get('ids')?.split(',').filter(Boolean).length === 0
      ? undefined
      : query.get('ids')?.split(',').filter(Boolean)
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',').filter(Boolean) ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof Response) {
    return languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEOS_WITH_FALLBACK>
  >({
    query: GET_VIDEOS_WITH_FALLBACK,
    variables: {
      metadataLanguageId,
      fallbackLanguageId,
      languageIds,
      limit,
      offset,
      labels: subTypes,
      ...(ids != null ? { ids } : {})
    }
  })

  const videos = data.videos
  const total = data.videosCount
  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries()),
    page: page.toString(),
    limit: limit.toString()
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title[0]?.value != null ||
      video.fallbackTitle[0]?.value != null ||
      video.snippet[0]?.value != null ||
      video.description[0]?.value != null
  )
  const lastPage = Math.ceil(total / limit) === 0 ? 1 : Math.ceil(total / limit)

  const mediaComponents = filteredVideos.map((video) => {
    const isDownloadable =
      video.label === 'collection' || video.label === 'series'
        ? false
        : (video.variant?.downloadable ?? false)
    return {
      mediaComponentId: video.id,
      componentType: video.variant?.hls != null ? 'content' : 'container',
      subType: video.label,
      contentType: video.variant?.hls != null ? 'video' : 'none',
      imageUrls: {
        thumbnail:
          video.images.find((image) => image.thumbnail != null)?.thumbnail ??
          '',
        videoStill:
          video.images.find((image) => image.videoStill != null)?.videoStill ??
          '',
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
      lengthInMilliseconds: video.variant?.lengthInMilliseconds ?? 0,
      containsCount: video.childrenCount,
      isDownloadable,
      downloadSizes: isDownloadable
        ? {
            approximateSmallDownloadSizeInBytes:
              video.variant?.downloads?.find(({ quality }) => quality === 'low')
                ?.size ?? 0,
            approximateLargeDownloadSizeInBytes:
              video.variant?.downloads?.find(
                ({ quality }) => quality === 'high'
              )?.size ?? 0
          }
        : {},
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
      studyQuestions: video.studyQuestions.map((question) => question.value),
      metadataLanguageTag: video.title[0]?.language.bcp47 ?? 'en',
      ...(expand.includes('languageIds')
        ? { languageIds: video.availableLanguages.map((id) => Number(id)) }
        : {})
    }
  })

  const queryString = new URLSearchParams(queryObject).toString()
  const firstQueryString = new URLSearchParams({
    ...queryObject,
    page: '1'
  }).toString()
  const lastQueryString = new URLSearchParams({
    ...queryObject,
    page: lastPage.toString()
  }).toString()
  const nextQueryString = new URLSearchParams({
    ...queryObject,
    page: (page + 1).toString()
  }).toString()
  const previousQueryString = new URLSearchParams({
    ...queryObject,
    page: (page - 1).toString()
  }).toString()

  const response = {
    page,
    limit,
    pages: lastPage,
    total,
    apiSessionId: '',
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-components?${queryString}`
      },
      first: {
        href: `http://api.arclight.org/v2/media-components?${firstQueryString}`
      },
      last: {
        href: `http://api.arclight.org/v2/media-components?${lastQueryString}`
      },
      ...(page < lastPage
        ? {
            next: {
              href: `http://api.arclight.org/v2/media-components?${nextQueryString}`
            }
          }
        : {}),
      ...(page > 1
        ? {
            previous: {
              href: `http://api.arclight.org/v2/media-components?${previousQueryString}`
            }
          }
        : {})
    },
    _embedded: {
      mediaComponents
    }
  }
  const responseJson = JSON.stringify(response)
  const etag = await generateETag(responseJson)

  return new Response(responseJson, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ETag: etag
    }
  })
}
