import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    ids
    rel
    languageIds
    expand
    metadataLanguageTags
    isDeprecated
*/

const GET_VIDEOS_CHILDREN = graphql(`
  query GetVideosChildren {
    videos(limit: 10000) {
      id
      children {
        id
      }
      parents {
        id
      }
    }
  }
`)

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams
  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEOS_CHILDREN>
  >({
    query: GET_VIDEOS_CHILDREN
  })

  const mediaComponentsLinks = data.videos
    .filter((video) => video.children.length > 0 || video.parents.length > 0)
    .map((video) => ({
      mediaComponentId: video.id,
      linkedMediaComponentIds: {
        ...(video.children.length > 0 ? { contains: video.children.map(({ id }) => id) } : {}),
        ...(video.parents.length > 0 ? { containedBy: video.parents.map(({ id }) => id) } : {})
      }
    }))

  const queryString = new URLSearchParams(queryObject).toString()
  const response = {
    _links: {
      self: {
        href: `https://api.arclight.com/v2/mediaComponents?${queryString}`
      }
    },
    _embedded: {
      mediaComponentsLinks
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}
