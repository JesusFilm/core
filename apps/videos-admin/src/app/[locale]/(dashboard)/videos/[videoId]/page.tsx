import { ReactElement } from 'react'

import { query } from '../../../../../libs/apollo'
import { GET_ADMIN_VIDEO } from '../../../../../libs/useAdminVideo'

import { VideoView } from './_VideoView'
import { VideoViewFallback } from './_VideoView/VideoViewFallback'

export const revalidate = 300

export default async function VideoViewPage({
  params
}: {
  params: Promise<{ videoId: string }>
}): Promise<ReactElement> {
  const { videoId } = await params

  const { data } = await query({
    query: GET_ADMIN_VIDEO,
    variables: { videoId }
  })

  if (data?.adminVideo == null) {
    return <VideoViewFallback />
  }

  return <VideoView video={data.adminVideo} />
}
