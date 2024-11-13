import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
isDeprecated,
metadataLanguageTags,
subTypes
*/

const GET_LANGUAGE_ID_FROM_BCP47 = graphql(`
  query GetLanguageIdFromBCP47($bcp47: ID!) {
    language(id: $bcp47, idType: bcp47) {
      id
    }
  }
`)

const GET_VIDEOS = graphql(`
  query GetVideos(
    $limit: Int
    $offset: Int
    $ids: [ID!]
    $languageIds: [ID!]
    $languageId: ID!
  ) {
    videosCount(where: { ids: $ids, availableVariantLanguageIds: $languageIds })
    videos(
      limit: $limit
      offset: $offset
      where: { ids: $ids, availableVariantLanguageIds: $languageIds }
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
      title(languageId: $languageId) {
        value
      }
      description(languageId: $languageId) {
        value
      }
      snippet(languageId: $languageId) {
        value
      }
      studyQuestions(languageId: $languageId) {
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

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams

  const page = Number(query.get('page') ?? 1)
  const limit = Number(query.get('limit') ?? 10000)
  const offset = (page - 1) * limit
  const expand = query.get('expand') ?? ''
  const languageIds = query.get('languageIds')?.split(',').filter(Boolean) ?? []
  const ids = query.get('ids')?.split(',').filter(Boolean) ?? undefined
  const metadataLanguageTags =
    query.get('metadataLanguageTags')?.split(',').filter(Boolean) ?? []

  const { data: languageIdData } =
    metadataLanguageTags.length > 0
      ? await getApolloClient().query<
          ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
        >({
          query: GET_LANGUAGE_ID_FROM_BCP47,
          variables: { bcp47: metadataLanguageTags[0] }
        })
      : { data: { language: { id: '529' } } }
  const defaultLanguageId = languageIdData.language?.id ?? '529'

  const { data } = await getApolloClient().query<ResultOf<typeof GET_VIDEOS>>({
    query: GET_VIDEOS,
    variables: {
      defaultLanguageId,
      languageIds,
      limit,
      offset,
      ...(ids != null ? { ids } : {})
    }
  })

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries()),
    page: page.toString(),
    limit: limit.toString()
  }
  const lastPage = Math.ceil(data.videosCount / limit)

  const mediaComponents = data.videos.map((video) => ({
    mediaComponentId: video.id,
    componentType: video.childrenCount === 0 ? 'content' : 'collection',
    contentType: 'video',
    subType: video.label,
    imageUrls: {
      thumbnail:
        video.images.find((image) => image.thumbnail != null)?.thumbnail ?? '',
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
    lengthInMilliseconds: video.variant?.duration ?? 0,
    containsCount: video.childrenCount,
    isDownloadable: video.variant?.downloadable ?? false,
    downloadSizes: {
      approximateSmallDownloadSizeInBytes:
        video.variant?.downloads?.find(({ quality }) => quality === 'low')
          ?.size ?? 0,
      approximateLargeDownloadSizeInBytes:
        video.variant?.downloads?.find(({ quality }) => quality === 'high')
          ?.size ?? 0
    },
    bibleCitations: video.bibleCitations.map((citation) => ({
      osisBibleBook: citation.osisId,
      chapterStart: citation.chapterStart,
      verseStart: citation.verseStart,
      chapterEnd: citation.chapterEnd,
      verseEnd: citation.verseEnd
    })),
    primaryLanguageId: Number(video.primaryLanguageId),
    title: video.title[0].value,
    shortDescription: video.snippet[0].value,
    longDescription: video.description[0].value,
    studyQuestions: video.studyQuestions.map((question) => question.value),
    metadataLanguageTag: video.variant?.language.bcp47 ?? 'en',
    ...(expand.includes('languageIds')
      ? { languageIds: video.variantLanguages.map(({ id }) => Number(id)) }
      : {})
  }))

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
    total: data.videosCount,
    apiSessionId: '',
    _links: {
      self: {
        href: `https://api.arclight.com/v2/mediaComponents?${queryString}`
      },
      first: {
        href: `https://api.arclight.com/v2/mediaComponents?${firstQueryString}`
      },
      last: {
        href: `https://api.arclight.com/v2/mediaComponents?${lastQueryString}`
      },
      ...(page < lastPage
        ? {
            next: {
              href: `https://api.arclight.com/v2/mediaComponents?${nextQueryString}`
            }
          }
        : {}),
      ...(page > 1
        ? {
            previous: {
              href: `https://api.arclight.com/v2/mediaComponents?${previousQueryString}`
            }
          }
        : {})
    },
    _embedded: {
      mediaComponents
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}
