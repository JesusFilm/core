import videojs from 'video.js'
import { ReactElement, useEffect, useRef, useCallback, MouseEvent } from 'react'
import { useMutation, gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { v4 as uuidv4 } from 'uuid'
import { TreeBlock, useEditor, ActiveTab } from '../..'
import { VideoResponseStateEnum } from '../../../__generated__/globalTypes'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoResponseCreate } from './__generated__/VideoResponseCreate'
import { VideoTrigger } from './VideoTrigger'
import 'video.js/dist/video-js.css'
import { VideoFields } from './__generated__/VideoFields'

export const VIDEO_RESPONSE_CREATE = gql`
  mutation VideoResponseCreate($input: VideoResponseCreateInput!) {
    videoResponseCreate(input: $input) {
      id
      state
      position
    }
  }
`

interface VideoProps extends TreeBlock<VideoFields> {
  uuid?: () => string
}

export function Video({
  id: blockId,
  videoContent,
  autoplay,
  startAt,
  muted,
  posterBlockId,
  uuid = uuidv4,
  children,
  ...props
}: VideoProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageFields> | undefined

  const [videoResponseCreate] = useMutation<VideoResponseCreate>(
    VIDEO_RESPONSE_CREATE
  )
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const mobile = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  const handleVideoResponse = useCallback(
    (videoState: VideoResponseStateEnum, videoPosition?: number): void => {
      const id = uuid()
      const position = videoPosition != null ? Math.floor(videoPosition) : 0

      void videoResponseCreate({
        variables: {
          input: {
            id,
            blockId,
            state: videoState,
            position
          }
        },
        optimisticResponse: {
          videoResponseCreate: {
            id,
            __typename: 'VideoResponse',
            state: videoState,
            position
          }
        }
      })
    },
    [blockId, uuid, videoResponseCreate]
  )

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: autoplay === true && !mobile,
        controls: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        controlBar: {
          playToggle: true,
          captionsButton: true,
          subtitlesButton: true,
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          volumePanel: {
            inline: true
          }
        },
        responsive: true,
        muted: muted === true,
        poster: posterBlock?.src != null ? posterBlock.src : undefined
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(startAt ?? 0)
      })

      if (selectedBlock === undefined) {
        playerRef.current.on('playing', () => {
          handleVideoResponse(
            VideoResponseStateEnum.PLAYING,
            playerRef.current?.currentTime()
          )
        })
        playerRef.current.on('pause', () => {
          handleVideoResponse(
            VideoResponseStateEnum.PAUSED,
            playerRef.current?.currentTime()
          )
        })
        playerRef.current.on('ended', () => {
          if (playerRef?.current?.isFullscreen() === true)
            playerRef.current?.exitFullscreen()
          handleVideoResponse(
            VideoResponseStateEnum.FINISHED,
            playerRef.current?.currentTime()
          )
        })
      }
    }
  }, [handleVideoResponse, startAt, muted, autoplay, blockId, posterBlock])

  useEffect(() => {
    if (selectedBlock !== undefined) {
      playerRef.current?.pause()
    }
  }, [selectedBlock])

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

    if (props.parentBlockId !== selectedStep?.id) {
      const block: TreeBlock<VideoFields> = {
        id: blockId,
        videoContent,
        autoplay,
        startAt,
        muted,
        posterBlockId,
        children,
        ...props
      }

      dispatch({ type: 'SetSelectedBlockAction', block })
    }

    dispatch({
      type: 'SetActiveTabAction',
      activeTab: ActiveTab.Properties
    })
    dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
  }

  return (
    <>
      {videoContent.src != null ? (
        <Box
          data-testid={`video-${blockId}`}
          sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: 4,
            overflow: 'hidden',
            m: 0,
            outline:
              selectedBlock?.id === blockId ? '3px solid #C52D3A' : 'none',
            outlineOffset: '5px',
            '> div': {
              width: '100%'
            }
          }}
          onClick={selectedBlock === undefined ? undefined : handleSelectBlock}
        >
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            style={{ display: 'flex', alignSelf: 'center', height: '100%' }}
            playsInline
          >
            <source
              src={videoContent.src}
              type={
                videoContent.__typename === 'VideoArclight'
                  ? 'application/x-mpegURL'
                  : undefined
              }
            />
          </video>
          {children?.map(
            (option) =>
              option.__typename === 'VideoTriggerBlock' && (
                <VideoTrigger player={playerRef.current} {...option} />
              )
          )}
        </Box>
      ) : (
        <Box
          sx={{
            outline:
              selectedBlock?.id === blockId ? '3px solid #C52D3A' : 'none',
            outlineOffset: '5px'
          }}
          onClick={selectedBlock === undefined ? undefined : handleSelectBlock}
        >
          <Paper
            sx={{
              borderRadius: (theme) => theme.spacing(4),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              fontSize: 100
            }}
            elevation={0}
            variant="outlined"
          >
            <VideocamRounded fontSize="inherit" />
          </Paper>
        </Box>
      )}
    </>
  )
}
