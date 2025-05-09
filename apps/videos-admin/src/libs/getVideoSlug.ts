import { gql } from '@apollo/client'

import { getApolloClient } from './apollo/apolloClient'

export async function getVideoSlug(videoId: string): Promise<string | null> {
  const client = await getApolloClient()
  const { data } = await client.query({
    query: gql`
      query GetVideoSlug($id: ID!) {
        adminVideo(id: $id) {
          slug
        }
      }
    `,
    variables: { id: videoId }
  })
  return data?.adminVideo?.slug ?? null
}
