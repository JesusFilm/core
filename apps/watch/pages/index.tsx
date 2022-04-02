import { ReactElement } from 'react'
import { VideoList } from '../src/components/Videos/VideoList/VideoList'

function VideoPage(): ReactElement {
  return (
    <VideoList
      filter={{
        availableVariantLanguageIds: ['529'],
        onlyPlaylists: true
      }}
      layout="carousel"
    />
  )
}

export default VideoPage
