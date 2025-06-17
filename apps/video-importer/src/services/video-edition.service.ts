import { GET_VIDEO_EDITION } from './gql/queries'
import { getGraphQLClient } from './graphqlClient'

export async function getVideoEditionId(
  videoId: string,
  editionName: string
): Promise<string | null> {
  const client = await getGraphQLClient()
  const data: {
    video?: {
      videoEditions?: Array<{ id: string; name: string }>
    }
  } = await client.request(GET_VIDEO_EDITION, { videoId })

  const videoEdition = data.video?.videoEditions?.find(
    (edition) => edition.name === editionName
  )
  return videoEdition?.id ?? null
}
