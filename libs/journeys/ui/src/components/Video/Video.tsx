import videojs from 'video.js'
import { ReactElement, useEffect, useRef, useCallback, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded'
import VolumeOffRounded from '@mui/icons-material/VolumeOffRounded'
import IconButton from '@mui/material/IconButton'
import FullscreenRounded from '@mui/icons-material/FullscreenRounded'
import { TreeBlock, useEditor } from '../..'
import { VideoResponseStateEnum } from '../../../__generated__/globalTypes'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoResponseCreate } from './__generated__/VideoResponseCreate'
import { VideoTrigger } from './VideoTrigger'
import 'video.js/dist/video-js.css'
import { VideoFields } from './__generated__/VideoFields'

export const VIDEO_RESPONSE_CREATE = gql`
  mutation VideoResponseCreate($input: VideoResponseCreateInput!) {
    videoResponseCreate(input: $input) {
      state
      position
    }
  }
`

export function Video({
  id: blockId,
  video,
  autoplay,
  startAt,
  muted,
  posterBlockId,
  fullsize,
  children
}: TreeBlock<VideoFields>): ReactElement {
  const [customControls, setCustomControls] = useState<boolean>(false)
  const [volume, setVolume] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageFields> | undefined

  const [videoResponseCreate] = useMutation<VideoResponseCreate>(
    VIDEO_RESPONSE_CREATE
  )
  const {
    state: { selectedBlock }
  } = useEditor()
  const mobile = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  const handleVideoResponse = useCallback(
    (videoState: VideoResponseStateEnum, videoPosition?: number): void => {
      const position = videoPosition != null ? Math.floor(videoPosition) : 0

      void videoResponseCreate({
        variables: {
          input: {
            blockId,
            state: videoState,
            position
          }
        },
        optimisticResponse: {
          videoResponseCreate: {
            __typename: 'VideoResponse',
            state: videoState,
            position
          }
        }
      })
    },
    [blockId, videoResponseCreate]
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
          if (playerRef.current?.isFullscreen() === false)
            playerRef.current?.controls(false)
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
        playerRef.current.on('fullscreenchange', () => {
          if (playerRef.current?.isFullscreen() === false) {
            playerRef.current?.controls(false)
            setCustomControls(false)
          }
          if (playerRef.current?.isFullscreen() === true) {
            playerRef.current?.controls(true)
            setCustomControls(true)
          }
        })
        if (muted === true) {
          setVolume(true)
        }
      }
    }
  }, [
    handleVideoResponse,
    startAt,
    muted,
    autoplay,
    blockId,
    posterBlock,
    mobile,
    selectedBlock,
    customControls
  ])

  const handleFullscreen = (): void => {
    playerRef.current?.requestFullscreen()
  }

  const handleMuted = (): void => {
    setVolume(!volume)
    playerRef.current?.muted(!volume)
  }

  useEffect(() => {
    if (selectedBlock !== undefined) {
      playerRef.current?.pause()
    }
  }, [selectedBlock])

  return (
    <Box
      data-testid={`video-${blockId} `}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        borderRadius: 4,
        overflow: 'hidden',
        m: 0,
        position: fullsize === true ? 'absolute' : null,
        top: fullsize === true ? 0 : null,
        right: fullsize === true ? 0 : null,
        bottom: fullsize === true ? 0 : null,
        left: fullsize === true ? 0 : null,
        outline: selectedBlock?.id === blockId ? '3px solid #C52D3A' : 'none',
        outlineOffset: fullsize === true ? '-3px' : null,
        '> .video-js': {
          width: '100%',
          display: 'flex',
          alignSelf: 'center',
          height: '100%'
        },
        '> .MuiIconButton-root': {
          color: '#FFFFFF',
          position: 'absolute',
          bottom: 12,
          zIndex: 1,
          '&:hover': {
            color: '#FFFFFF'
          }
        }
      }}
    >
      {video?.variant?.hls != null ? (
        <>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            playsInline
          >
            <source src={video.variant.hls} type="application/x-mpegURL" />
          </video>
          {!customControls && (
            <>
              <IconButton
                data-testid="video-mute"
                onClick={handleMuted}
                sx={{ left: 20 }}
              >
                {volume ? (
                  <VolumeOffRounded fontSize="large" />
                ) : (
                  <VolumeUpRounded fontSize="large" />
                )}
              </IconButton>
              <IconButton
                data-testid="video-fullscreen"
                onClick={handleFullscreen}
                sx={{ right: 20 }}
              >
                <FullscreenRounded fontSize="large" />
              </IconButton>
            </>
          )}
          {children?.map(
            (option) =>
              option.__typename === 'VideoTriggerBlock' && (
                <VideoTrigger player={playerRef.current} {...option} />
              )
          )}
        </>
      ) : (
        <>
          <Paper
            sx={{
              borderRadius: (theme) => theme.spacing(4),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              fontSize: 100
            }}
            elevation={0}
            variant="outlined"
          >
            <VideocamRounded fontSize="inherit" />
          </Paper>
        </>
      )}
    </Box>
  )
}
