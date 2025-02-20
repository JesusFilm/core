import { ResultOf, graphql } from 'gql.tada'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from '../../../../lib/apolloClient'
import { getLanguageIdsFromTags } from '../../../../lib/getLanguageIdsFromTags'

import { mediaComponentLinksWithId } from './[mediaComponentId]'

const GET_VIDEOS_CHILDREN = graphql(`
  query GetVideosChildren(
    $ids: [ID!]
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
    $limit: Int
  ) {
    videos(where: { ids: $ids }, limit: $limit) {
      id
      children {
        id
      }
      parents {
        id
      }
      title(languageId: $metadataLanguageId) {
        value
      }
      fallbackTitle: title(languageId: $fallbackLanguageId) {
        value
      }
    }
  }
`)

export const mediaComponentLinks = new Hono()
mediaComponentLinks.route('/:mediaComponentId', mediaComponentLinksWithId)

mediaComponentLinks.get('/', async (c) => {
  const ids = c.req.query('ids')?.split(',').filter(Boolean) ?? undefined
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',') ?? []
  const queryObject = c.req.query()

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEOS_CHILDREN>
  >({
    query: GET_VIDEOS_CHILDREN,
    variables: {
      ids,
      metadataLanguageId,
      fallbackLanguageId,
      limit: 10000
    }
  })

  const mediaComponentsLinks = data.videos
    .filter((video) => video.children.length > 0 || video.parents.length > 0)
    .filter(
      (video) =>
        video.title[0]?.value != null || video.fallbackTitle[0]?.value != null
    )
    .map((video) => ({
      mediaComponentId: video.id,
      linkedMediaComponentIds: {
        ...(video.children.length > 0
          ? { contains: video.children.map(({ id }) => id) }
          : {}),
        ...(video.parents.length > 0
          ? { containedBy: video.parents.map(({ id }) => id) }
          : {})
      }
    }))

  const queryString = new URLSearchParams(queryObject).toString()
  const response = {
    _links: {
      self: {
        href: `http://api.arclight.org/v2/mediaComponents?${queryString}`
      }
    },
    _embedded: {
      mediaComponentsLinks
    }
  }
  return c.json(response)
})
