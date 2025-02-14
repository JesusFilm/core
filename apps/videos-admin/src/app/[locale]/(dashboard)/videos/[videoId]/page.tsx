import { ReactElement, Suspense } from 'react'

import { PreloadQuery } from '../../../../../libs/apollo'
import { GET_ADMIN_VIDEO } from '../../../../../libs/useAdminVideo'

import { VideoView } from './_VideoView'
import { VideoViewLoading } from './_VideoView/VideoViewLoading'

export const revalidate = 300

export default async function VideoViewPage({
  params
}: {
  params: Promise<{ videoId: string }>
}): Promise<ReactElement> {
  const { videoId } = await params

  return (
    <PreloadQuery query={GET_ADMIN_VIDEO} variables={{ videoId }}>
      {(queryRef) => (
        <Suspense fallback={<VideoViewLoading />}>
          <VideoView queryRef={queryRef} />
        </Suspense>
      )}
    </PreloadQuery>
  )
}
