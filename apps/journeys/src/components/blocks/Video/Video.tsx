import React, { ReactElement } from 'react'
import { Container } from '@mui/material'
import { VideoPlayer } from './VideoPlayer'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'

export const Video = ({
  src,
  volume = 0,
  autoplay = false
}: TreeBlock<VideoBlock>): ReactElement => {
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
      <VideoPlayer options={videoJsOptions} />
    </Container>
  )
}
