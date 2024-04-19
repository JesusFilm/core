import { ResultOf, graphql } from 'gql.tada'
import { NextRequest, NextResponse } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'

const GET_VIDEOS = graphql(`
  query GetVideos($limit: Int, $offset: Int) {
    videos(limit: $limit, offset: $offset) {
      id
      label
      image
      primaryLanguageId
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
      childrenCount
      variant {
        duration
        language {
          bcp47
        }
        downloads {
          quality
          size
        }
      }
    }
  }
`)

function paramsToRecord(
  entries: IterableIterator<[string, string]>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of entries) {
    // each 'entry' is a [key, value] tupple
    result[key] = value
  }
  return result
}

export async function GET(
  request: NextRequest,
  res: NextResponse
): Promise<Response> {
  const query = request.nextUrl.searchParams

  const page = Number(query.get('page') ?? 1)
  const limit = Number(query.get('limit') ?? 10000)
  const offset = (page - 1) * limit

  const { data } = await getApolloClient().query<ResultOf<typeof GET_VIDEOS>>({
    query: GET_VIDEOS,
    variables: {
      languageId: '529',
      limit,
      offset
    }
  })

  const entries = query.entries()
  const queryObject: Record<string, string> = {
    ...paramsToRecord(entries),
    page: page.toString(),
    limit: limit.toString()
  }

  const mediaComponents = data.videos.map((video) => ({
    mediaComponentId: video.id,
    componentType: video.childrenCount === 0 ? 'content' : 'collection',
    contentType: 'video',
    subType: video.label,
    imageUrls: {
      hd: video.image
    },
    lengthInMilliseconds: video.variant?.duration ?? 0,
    containsCount: video.childrenCount,
    // TODO: Needs new field in the schema
    isDownloadable: true,
    downloadSizes: {
      approximateSmallDownloadSizeInBytes:
        video.variant?.downloads?.find(({ quality }) => quality === 'low')
          ?.size ?? 0,
      approximateLargeDownloadSizeInBytes:
        video.variant?.downloads?.find(({ quality }) => quality === 'high')
          ?.size ?? 0
    },
    // TODO: Needs new field in the schema
    bibleCitations: [],
    primaryLanguageId: video.primaryLanguageId,
    title: video.title[0].value,
    shortDescription: video.snippet[0].value,
    longDescription: video.description[0].value,
    studyQuestions: video.studyQuestions.map((question) => question.value),
    metadataLanguageTag: video.variant?.language.bcp47 ?? 'en'
  }))

  const queryString = new URLSearchParams(queryObject).toString()
  const firstQueryString = new URLSearchParams({
    ...queryObject,
    page: '1'
  }).toString()
  // TODO: Needs new query in gql
  const lastQueryString = new URLSearchParams({
    ...queryObject,
    page: '1192'
  }).toString()
  const nextQueryString = new URLSearchParams({
    ...queryObject,
    page: (page + 1).toString()
  }).toString()

  const response = {
    page,
    limit,
    // TODO: Needs new query in gql
    pages: 1192,
    // TODO: Needs new query in gql
    total: 1192,
    // TODO: Needs new query in gql
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
      next: {
        href: `https://api.arclight.com/v2/mediaComponents?${nextQueryString}`
      }
    },
    _embedded: {
      mediaComponents
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}
