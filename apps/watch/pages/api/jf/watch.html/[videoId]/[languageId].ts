import { NextApiRequest, NextApiResponse } from 'next'
import { gql } from '@apollo/client'
import { createApolloClient } from '../../../../../src/libs/client'
import {
  GetVideo,
  GetVideo_video as Video
} from '../../../../../__generated__/GetVideo'

export const GET_VIDEO = gql`
  # TODO: Use this code when Siyang's PR gets merged in
  # query Video($videoId: ID!, $languageId: ID) {
  #   video(id: $videoId, idType: $idType) {
  #     id
  #     variant(languageId: $languageId) {
  #       id
  #       slug {
  #         value
  #       }
  #     }
  #   }
  # }
  query Video($videoId: ID!, $languageId: ID) {
    video(id: $videoId) {
      id
      variant(languageId: $languageId) {
        id
      }
      slug {
        value
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
  // call graphql for required video
  const { data } = await apolloClient.query<GetVideo>({
    query: GET_VIDEO,
    variables: {
      videoId: (videoId as string).replace(/\.html?/, ''),
      languageId: (languageId as string).replace(/\.html?/, '')
    }
  })

  // if video then redirect, else return 404
  if (data != null) {
    res.redirect(302, `/${data.video.slug[0].value}`)
  } else {
    res.status(404).json({ success: false })
  }
  // TODO: use this logic below once Siyangs PR is merged in
  // if (data.video?.variant?.slug) {
  //   res.redirect(302, `/${data.video.variant.slug}`)
  // } else {
  //   res.status(404).json({ success: false })
  // }
  const newSlug = data.video.slug[0].value
  res.status(200).json({ videoId, languageId, newSlug })
}
