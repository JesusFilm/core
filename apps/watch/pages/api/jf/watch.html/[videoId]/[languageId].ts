import { NextApiRequest, NextApiResponse } from 'next'
import { gql, useQuery } from '@apollo/client'

export const VIDEO = gql`
  query Video($videoId: ID!, $languageId: ID) {
    video(id: $videoId, idType: $idType) {
      id
      variant(languageId: $languageId) {
        id
        slug
      }
    }
  }
`

export default function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  const { videoId, languageId } = req.query

  // call graphql for required video
  const { data } = useQuery(VIDEO, {
    variables: { id: videoId, languageId: languageId }
  })

  // if video redirect

  // if no video return 4040
  //   if (data.video?.variant?.slug) {
  //     res.redirect(302, `/${data.video.variant.slug}`)
  //   } else {
  //     res.status(404).json({ success: false })
  //   }

  res.status(200).json({ videoId, languageId })
}
