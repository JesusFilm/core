import React, { ReactElement } from 'react'
import { VideoPlayer } from './VideoPlayer'

export const Video = (): ReactElement => {
  const videoJsOptions = {
    autoplay: 'muted',
    controls: true,
    volume: 0,
    fullscreenToggle: true,
    fullscreenOnDoubleClick: true,
    sources: [
      {
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
      }
    ]
  }

  return (
    <div>
      <VideoPlayer options={videoJsOptions} />
    </div>
  )
}
