import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    expand
    rel
    languageIds
    isDeprecated
    metadataLanguageTags
*/

interface GetParams {
  params: { mediaComponentId: string }
}

const GET_VIDEO_CHILDREN = graphql(`
  query GetVideoChildren($id: ID!) {
    video(id: $id) {
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

export async function GET(
  req: NextRequest,
  { params }: GetParams
): Promise<Response> {
  const { mediaComponentId } = params
  const query = req.nextUrl.searchParams

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEO_CHILDREN>
  >({
    query: GET_VIDEO_CHILDREN,
    variables: {
      id: mediaComponentId
    }
  })

  if (data.video == null)
    return new Response(
      JSON.stringify({
        message: `${mediaComponentId}:\n  Media-component ID(s) '${mediaComponentId}' not allowed.\n${mediaComponentId}:\n    Media-component ID(s) '${mediaComponentId}' not found.\n`,
        logref: 404
      }),
      { status: 404 }
    )

  const linkedMediaComponentIds = {
    ...(data.video.children.length > 0 ? { contains: data.video.children.map(({ id }) => id) } : {}),
    ...(data.video.parents.length > 0 ? { containedBy: data.video.parents.map(({ id }) => id) } : {})
  }

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()

  const response = {
    mediaComponentId,
    linkedMediaComponentIds,
    _links: {
      self: {
        href: `https://api.arclight.com/v2/media-component-links/${mediaComponentId}?${queryString}`
      },
      mediaComponent: [
        {
          href: `http://api.arclight.org/v2/media-components/${mediaComponentId}?apiKey=616db012e9a951.51499299`
        },
        {
          href: 'http://api.arclight.org/v2/media-components/{mediaComponentId}{?apiKey}',
          templated: true
        }
      ]
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}
