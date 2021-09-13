import React, { ReactElement, useState } from 'react'
import { Container } from '@mui/material'
import { VideoPlayer } from './VideoPlayer'
import { VideoOverlay } from '../VideoOverlay/'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'

export const Video = ({ src, children }: TreeBlock<VideoBlock>): ReactElement => {
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
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
      }
    ]
  }

  return (
    <Container data-testid="VideoComponent" maxWidth="md">
      {console.log(src)}
      <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady}>
        {children != null
          ? children?.map(
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
