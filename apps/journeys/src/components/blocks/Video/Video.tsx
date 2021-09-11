import React, { ReactElement, useState } from 'react'
import { VideoPlayer } from './VideoPlayer'
import { Container } from '@material-ui/core'
import { VideoType } from '../../../types'
import { VideoOverlay } from '../VideoOverlay/'

export const Video = (block: VideoType): ReactElement => {
  const [latestEvent, setLatestEvent] = useState('ready')

  const handlePlayerReady = (player): void => {
    player.on('timeupdate', () => { console.log(player.currentTime()) })
    player.on('pause', () => { setLatestEvent('paused') })
    player.on('play', () => { setLatestEvent('played') })
    player.on('end', () => { setLatestEvent('ended') })
  }

  const videoJsOptions = {
    autoplay: 'muted',
    controls: true,
    volume: 0,
    initialLoad: true,
    sources: [
      {
        src: block.sources[0].src
      }
    ]
  }

  return (
    <Container data-testid="VideoComponent" maxWidth="md">
      <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady}>
        {block.children != null
          ? block.children?.map(
            (block) => {
              if (block.__typename === 'VideoOverlay') return <VideoOverlay {...block} key={block.id} latestEvent={latestEvent} />
              return null
            }
          )
          : null}
      </VideoPlayer>
    </Container>
  )
}
