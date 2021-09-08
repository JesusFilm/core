import React, { ReactElement, useState } from 'react'
import { VideoPlayer } from './VideoPlayer'
import { Container } from '@material-ui/core'
import { VideoType } from '../../../types'
import { RadioQuestion } from '../RadioQuestion/'

export const Video = (block: VideoType): ReactElement => {
  const [showPausedChildren, setShowPausedChildren] = useState(false)
  const [showOnTimeReachedChildren, setShowOnTimeReachedChildren] = useState(false)

  const handlePlayerReady = (player): void => {
    const OnTimeReached = block.children?.find(child => child.__typename === 'OnTimeReached')
    const OnVideoPaused = block.children?.find(child => child.__typename === 'OnVideoPaused')

    if (OnTimeReached != null) {
      player.on('timeupdate', () => {
        const madeIt = player.currentTime() > OnTimeReached.secondsWatched
        if (madeIt && !showOnTimeReachedChildren) {
          setShowOnTimeReachedChildren(true)
        }
      })
    }

    if (OnVideoPaused != null) {
      player.on('pause', () => {
        setShowPausedChildren(true)
      })
    }
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
              if (block.__typename === 'RadioQuestion') return <RadioQuestion {...block} key={block.id} />
              if (block.__typename === 'OnTimeReached' && block.children != null && block.children[0].__typename === 'RadioQuestion' && showOnTimeReachedChildren) return <RadioQuestion {...block.children[0]} key={block.children[0].id} />
              if (block.__typename === 'OnVideoPaused' && block.children != null && block.children[0].__typename === 'RadioQuestion' && showPausedChildren) return <RadioQuestion {...block.children[0]} key={block.children[0].id} />
              return null
            }
          )
          : null}
      </VideoPlayer>
    </Container>
  )
}
