import videojs from 'video.js'
import React, { ReactElement, useEffect, useRef, useState, useCallback } from 'react'
import { Container } from '@mui/material'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, gql } from '@apollo/client'
import { VideoResponseCreate } from '../../../../__generated__/VideoResponseCreate'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'
import { Trigger } from '../Trigger'

import 'video.js/dist/video-js.css'

export const VIDEO_RESPONSE_CREATE = gql`
  mutation VideoResponseCreate(
    $input: VideoResponseCreateInput!
  ) {
    videoResponseCreate(input: $input) {
      id,
      state
    }
  }
`

interface VideoProps extends TreeBlock<VideoBlock> {
  uuid?: () => string
}

export function Video({ id: blockId, mediaComponentId, languageId, autoplay, uuid = uuidv4, children }: VideoProps): ReactElement {
  const videoNode = useRef<HTMLVideoElement>(null)
  const [videoResponseCreate] = useMutation<VideoResponseCreate>(VIDEO_RESPONSE_CREATE)
  const player = useRef<videojs.Player>()
  const url = `https://arc.gt/hls/${mediaComponentId}/${languageId}`

  const [videoUrl, setVideoUrl] = useState<string | undefined>()
  const [isReady, setIsReady] = useState<boolean | undefined>()
  const [autoPlaySuccess, setAutoplaySuccess] = useState<boolean>(false)

  const handleVideoResponse = useCallback(async (videoState: VideoResponseStateEnum): Promise<void> => {
    const id = uuid()
    await videoResponseCreate({
      variables: {
        input: {
          id,
          blockId,
          state: videoState
        }
      },
      optimisticResponse: {
        videoResponseCreate: {
          id,
          __typename: 'VideoResponse',
          state: videoState
        }
      }
    })
  }, [blockId, uuid, videoResponseCreate])

  const validate = async (url: string): Promise<void> => {
    return await fetch(url).then((response) => setVideoUrl(response.url))
  }

  useEffect(() => {
    void validate(url)

    if (videoUrl !== undefined) {
      const initialOptions: videojs.PlayerOptions = {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        autoplay: autoplay ? 'muted' : false,
        controls: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        controlBar: {
          playToggle: true,
          captionsButton: true,
          chaptersButton: true,
          subtitlesButton: true,
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          playbackRateMenuButton: true,
          volumePanel: {
            inline: true
          }
        },
        sources: [
          {
            src: videoUrl
          }
        ],
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.5, 2]
      }

      if (videoNode.current != null) {
        player.current = videojs(videoNode.current, {
          ...initialOptions
        })
        player.current.on('ready', () => {
          setIsReady(true)
        })
        player.current.on('playing', () => {
          void handleVideoResponse(VideoResponseStateEnum.PLAYING)
        })
        player.current.on('pause', () => {
          void handleVideoResponse(VideoResponseStateEnum.PAUSED)
        })
        player.current.on('ended', () => {
          void handleVideoResponse(VideoResponseStateEnum.FINISHED)
        })
        player.current.on('timeupdate', () => {
          // TODO: figure out how we want to record video response
        })
        player.current.on('autoplay-success', () => setAutoplaySuccess(true))
      }
    }
  }, [videoNode, autoplay, children, mediaComponentId, languageId, handleVideoResponse, videoUrl, url])

  useEffect(() => {
    if (
      isReady === true &&
      autoplay === true &&
      !autoPlaySuccess &&
      navigator.userAgent.match(/Firefox/i) != null
    ) {
      player.current?.defaultMuted(true)
      player.current?.setAttribute('autoplay', '')
      player.current?.play()
    }
  }, [player, isReady, autoPlaySuccess, autoplay])

  return (
    <Container maxWidth="md">
      <video ref={videoNode} className="video-js" data-testid="VideoComponent">
        {children?.map((option) => option.__typename === 'TriggerBlock' && (
          <Trigger player={player.current} {...option} />
        ))}
      </video>
    </Container>
  )
}
