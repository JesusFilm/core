import Box from '@mui/material/Box'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'
import { VideoFields_mediaVideo } from '../../../../Video/__generated__/VideoFields'

export interface TemplateVideoPlayerProps {
  id?: string | null
  mediaVideo?: VideoFields_mediaVideo | null
  source?: VideoBlockSource
  poster?: string
  startAt: number
  endAt: number
}

export function TemplateVideoPlayer({
  id,
  source,
  poster,
  startAt = 0,
  endAt,
  mediaVideo
}: TemplateVideoPlayerProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<Player>()

  useEffect(() => {
    if (videoRef.current != null) {
      setPlayer(
        videojs(videoRef.current, {
          errorDisplay: false,
          autoplay: true,
          controls: true,
          bigPlayButton: false,
          fluid: true,
          poster,
          // Make video fill container instead of set aspect ratio
          fill: true,
          userActions: {
            hotkeys: true,
            doubleClick: true
          },
          responsive: true
        })
      )
    }
  }, [poster])

  useEffect(() => {
    // make sure swiper-js is not interrupting interaction with certain components of video-js
    player
      ?.getChild('ControlBar')
      ?.getChild('ProgressControl')
      ?.addClass('swiper-no-swiping')

    player
      ?.getChild('ControlBar')
      ?.getChild('ProgressControl')
      ?.setAttribute('style', 'display: flex')

    player
      ?.getChild('ControlBar')
      ?.getChild('RemainingTimeDisplay')
      ?.setAttribute('style', 'display: flex')

    player
      ?.getChild('ControlBar')
      ?.getChild('VolumePanel')
      ?.addClass('swiper-no-swiping')

    const startTime = startAt ?? 0
    if (player != null) {
      const handleVideoTimeChange = (): void => {
        if (endAt > 0 && (player.currentTime() ?? 0) > endAt) {
          player.pause()
          if (player.isFullscreen() ?? false) void player.exitFullscreen()
        }
      }
      player.currentTime(startTime)
      player.on('timeupdate', handleVideoTimeChange)
    }
  }, [player, startAt, endAt])

  return (
    <Box
      data-testid={`TemplateVideoPlayer-${id ?? 'emptyVideo'}`}
      sx={{
        overflow: 'hidden',
        borderRadius: 4,
        position: 'relative',
        zIndex: 2
      }}
    >
      <video
        data-testid="TemplateVideoPlayer"
        ref={videoRef}
        className="video-js vjs-tech"
        playsInline
        style={{ height: '100%' }}
      >
        {source === VideoBlockSource.internal && id != null && (
          <source src={id} type="application/x-mpegURL" />
        )}
        {source === VideoBlockSource.youTube && id != null && (
          <source
            src={`https://www.youtube.com/embed/${id}?start=${startAt}&end=${endAt}`}
            type="video/youtube"
          />
        )}
        {mediaVideo?.__typename === 'MuxVideo' &&
          mediaVideo?.playbackId != null && (
            <source
              src={`https://stream.mux.com/${mediaVideo.playbackId}.m3u8`}
              type="application/x-mpegURL"
            />
          )}
      </video>
    </Box>
  )
}
