import { gql } from '@apollo/client'
import { NextRequest, NextResponse } from 'next/server'

import { GetVideos } from '../../../../__generated__/GetVideos'
import { getApolloClient } from '../../../lib/apolloClient'

const GET_VIDEOS = gql`
  query GetVideos($limit: Int, $offset: Int) {
    videos(limit: $limit, offset: $offset) {
      id
    }
  }
`
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

  const { data } = await getApolloClient().query<GetVideos>({
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
    mediaComponentId: video.id
  }))

  const queryString = new URLSearchParams(queryObject).toString()
  const response = {
    _links: {
      self: {
        href: `https://api.arclight.com/v2/mediaComponents?${queryString}`
      }
    },
    _embedded: {
      mediaComponents
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}
