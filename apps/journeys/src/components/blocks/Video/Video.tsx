import React, { ReactElement } from 'react'
import { VideoPlayer } from './VideoPlayer'
import { Container } from '@material-ui/core'
import { VideoType } from '../../../types'
import { RadioQuestion } from '../RadioQuestion/'

export const Video = (block: VideoType): ReactElement => {
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
      <VideoPlayer options={videoJsOptions}>
        {block.children != null
          ? block.children?.map(
            (question) =>
              question.__typename === 'RadioQuestion' && (
              <RadioQuestion {...question} key={question.id} />
              )
          )
          : null}
      </VideoPlayer>
    </Container>
  )
}
