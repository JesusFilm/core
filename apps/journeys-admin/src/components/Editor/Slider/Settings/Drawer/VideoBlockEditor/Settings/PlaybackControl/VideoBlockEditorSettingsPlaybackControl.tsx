import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import isArray from 'lodash/isArray'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { TreeBlock } from '@core/journeys/ui/block'
import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../../__generated__/globalTypes'

interface PlaybackState {
  startAt: number
  currentTime: number
  endAt: number
}

const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  startAt: 0,
  currentTime: 0,
  endAt: 0
}

interface VideoBlockEditorSettingsPlaybackControlProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (input: VideoBlockUpdateInput) => Promise<void>
}

export function VideoBlockEditorSettingsPlaybackControl({
  selectedBlock,
  onChange
}: VideoBlockEditorSettingsPlaybackControlProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player>()
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    DEFAULT_PLAYBACK_STATE
  )

  function getVideoSource(): { src: string; type: string } | null {
    if (
      selectedBlock?.source === VideoBlockSource.cloudflare &&
      selectedBlock?.videoId != null
    ) {
      return {
        src: `https://customer-${
          process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? ''
        }.cloudflarestream.com/${selectedBlock?.videoId}/manifest/video.m3u8?clientBandwidthHint=10`,
        type: 'application/x-mpegURL'
      }
    }

    if (
      selectedBlock?.source === VideoBlockSource.internal &&
      selectedBlock?.video?.variant?.hls != null
    ) {
      return {
        src: selectedBlock.video.variant.hls,
        type: 'application/x-mpegURL'
      }
    }

    if (selectedBlock?.source === VideoBlockSource.youTube) {
      return {
        src: `https://www.youtube.com/embed/${selectedBlock.videoId}?start=${
          selectedBlock.startAt ?? 0
        }&end=${selectedBlock.endAt ?? 0}`,
        type: 'video/youtube'
      }
    }

    return null
  }

  const videoSource = getVideoSource()

  async function handlePlaybackChange(
    _event: Event,
    value: number | number[]
  ): Promise<void> {
    if (!isArray(value) || value.length !== 3) return

    const [startAt, currentTime, endAt] = value.map(Math.round)

    if (currentTime !== playbackState.currentTime) {
      playerRef.current?.currentTime(currentTime)
    }

    setPlaybackState({ startAt, currentTime, endAt })
    await onChange({ startAt, endAt })
  }

  // Initialize video player
  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        fluid: true,
        controls: true,
        controlBar: false,
        bigPlayButton: true
      })
    }
  }, [])

  // Update playback state when selectedBlock changes
  useEffect(() => {
    if (
      playerRef.current == null ||
      selectedBlock?.startAt == null ||
      selectedBlock?.endAt == null
    )
      return

    setPlaybackState({
      startAt: selectedBlock.startAt,
      currentTime: selectedBlock.startAt,
      endAt: selectedBlock.endAt - 0.25
    })
  }, [selectedBlock])

  // Handle video time updates
  useEffect(() => {
    if (playerRef.current == null) return

    function handleVideoProgression(): void {
      const currentTime = playerRef.current?.currentTime() ?? 0
      if (
        currentTime >= playbackState.startAt &&
        currentTime <= playbackState.endAt
      ) {
        setPlaybackState((prevState) => ({ ...prevState, currentTime }))
      } else {
        playerRef.current?.currentTime(playbackState.startAt)
      }
    }

    playerRef.current.on('timeupdate', handleVideoProgression)
    return () => playerRef.current?.off('timeupdate', handleVideoProgression)
  }, [playbackState.startAt, playbackState.endAt])

  const valueLabelFormat = (value: number, index: number): string => {
    const time = secondsToTimeFormat(value)
    switch (index) {
      case 0:
        return `Start At: ${time}`
      case 2:
        return `End At: ${time}`
      default:
        return time
    }
  }

  console.log('selectedBlock', selectedBlock)
  console.log('playbackState', playbackState)

  return (
    <Stack direction="column" spacing={2}>
      <Typography
        variant="subtitle2"
        sx={{ color: selectedBlock == null ? 'action.disabled' : undefined }}
      >
        {t('Timing')}
      </Typography>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
      >
        {videoSource != null && <source {...videoSource} />}
      </video>
      <Slider
        aria-label="video-playback-control"
        size="medium"
        min={0}
        max={Math.round(selectedBlock?.duration ?? 0)}
        value={[
          playbackState.startAt,
          playbackState.currentTime,
          playbackState.endAt
        ]}
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat}
        onChange={handlePlaybackChange}
        disableSwap
        sx={{
          '& .MuiSlider-thumb': {
            width: 15,
            height: 15
          },
          '& .MuiSlider-thumb[data-index="0"]': {
            backgroundColor: (theme) => theme.palette.primary.dark
          },
          '& .MuiSlider-thumb[data-index="1"]': {
            backgroundColor: (theme) => theme.palette.primary.light
          },
          '& .MuiSlider-thumb[data-index="2"]': {
            backgroundColor: (theme) => theme.palette.primary.dark
          }
        }}
      />
    </Stack>
  )
}
