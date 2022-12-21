import { NextApiRequest, NextApiResponse } from 'next'
import { gql } from '@apollo/client'
import { createApolloClient } from '../../../../../src/libs/apolloClient'
import { GetVideo } from '../../../../../__generated__/GetVideo'

export const GET_VIDEO = gql`
  query GetVideo($videoId: ID!, $languageId: ID) {
    video(id: $videoId) {
      id
      variant(languageId: $languageId) {
        id
        slug
      }
    }
  }
`

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { videoId, languageId } = req.query
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetVideo>({
    query: GET_VIDEO,
    variables: {
      videoId: (videoId as string).replace(/\.html?/, ''),
      languageId: (languageId as string).replace(/\.html?/, '')
    }
  })
  if (data.video?.variant?.slug != null) {
    res.redirect(302, `/${data.video.variant.slug}`)
  } else {
    res.redirect(302, '/404')
  }
}
