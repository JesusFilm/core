import { ReactElement } from 'react'
import { VideoList } from '../src/components/Videos/VideoList/VideoList'
import { VideoType } from '../__generated__/globalTypes'

function VideoPage(): ReactElement {
  return (
    <VideoList
      filter={{
        availableVariantLanguageIds: ['529'],
        types: [VideoType.playlist, VideoType.standalone],
        tagId: 'JFM1'
      }}
      layout="carousel"
    />
  )
}

export default VideoPage
