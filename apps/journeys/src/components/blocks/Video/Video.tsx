import React, { ReactElement, useState } from 'react'
import { Container } from '@mui/material'
import { VideoPlayer } from './VideoPlayer'
import { VideoOverlay } from '../VideoOverlay/'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'

export const Video = ({ src, volume = 0, autoplay = false, children }: TreeBlock<VideoBlock>): ReactElement => {
  const [latestEvent, setLatestEvent] = useState('READY')

  const handlePlayerReady = (player): void => {
    player.on('pause', () => { setLatestEvent('PAUSED') })
    player.on('play', () => { setLatestEvent('PLAYED') })
    player.on('end', () => { setLatestEvent('ENDED') })
  }

  const videoJsOptions = {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    autoplay: autoplay ? 'muted' : false,
    controls: true,
    volume: volume,
    initialLoad: true,
    bigPlayButton: false,
    sources: [
      {
        src: src
      }
    ]
  }

  return (
    <Container data-testid="VideoComponent" maxWidth="md">
      <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady}>
        {children != null
          ? children?.map(
            (block) => {
              if (block.__typename === 'VideoOverlayBlock') return <VideoOverlay {...block} key={block.id} latestEvent={latestEvent} />
              return null
            }
          )
          : null}
      </VideoPlayer>
    </Container>
  )
}
