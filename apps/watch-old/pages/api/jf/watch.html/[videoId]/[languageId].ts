import { gql } from '@apollo/client'
import { NextApiRequest, NextApiResponse } from 'next'

import { GetVideo } from '../../../../../__generated__/GetVideo'
import { createApolloClient } from '../../../../../src/libs/apolloClient'

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
    const [videoId, languageId] = data.video.variant.slug.split('/')
    res.redirect(`/watch/${videoId}.html/${languageId}.html`)
  } else {
    res.status(404).send({ error: 'video could not be found' })
  }
}
