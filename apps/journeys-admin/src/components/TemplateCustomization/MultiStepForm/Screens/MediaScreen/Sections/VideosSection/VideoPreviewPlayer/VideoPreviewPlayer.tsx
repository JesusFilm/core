import Box from '@mui/material/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'

import VideoJsPlayer from '@core/journeys/ui/Video/utils/videoJsTypes'
import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import type { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { getVideoPoster } from './getVideoPoster'

import 'video.js/dist/video-js.css'

interface VideoPreviewPlayerProps {
  videoBlock: VideoBlock
}

/**
 * Renders only the video player for a journey VideoBlock.
 * Supports YouTube, Mux, and internal (Video) sources with the same Box + video.js structure.
 * No Select button, description, title, or duration overlay — video only.
 *
 * @remarks
 * Not yet wired into VideosSection; use when implementing the Media step video preview.
 */
export function VideoPreviewPlayer({
  videoBlock
}: VideoPreviewPlayerProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<VideoJsPlayer | null>(null)

  const source = videoBlock.source
  const mediaVideo = videoBlock.mediaVideo

  const isMux =
    source === VideoBlockSource.mux &&
    mediaVideo?.__typename === 'MuxVideo' &&
    mediaVideo.playbackId != null
  const isYouTube =
    source === VideoBlockSource.youTube && videoBlock.videoId != null
  const isInternal =
    (source === VideoBlockSource.internal ||
      source === VideoBlockSource.cloudflare) &&
    mediaVideo?.__typename === 'Video'

  useEffect(() => {
    if (videoRef.current == null) return

    playerRef.current = videojs(videoRef.current, {
      ...defaultVideoJsOptions,
      fluid: true,
      controls: true,
      poster: getVideoPoster(videoBlock)
    }) as VideoJsPlayer

    return () => {
      if (playerRef.current != null && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [
    isMux,
    isYouTube,
    isInternal,
    mediaVideo,
    videoBlock.videoId,
    videoBlock.image
  ])

  // Unsupported source: render nothing (caller can hide section or show message)
  if (!isMux && !isYouTube && !isInternal) {
    return <Box data-testid="VideoPreviewPlayer-unsupported" />
  }

  return (
    <Box
      role="region"
      aria-label="Video preview"
      sx={{
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '& .vjs-poster img': {
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }
      }}
    >
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
      >
        {isYouTube && videoBlock.videoId != null && (
          <source
            src={`https://www.youtube.com/watch?v=${videoBlock.videoId}`}
            type="video/youtube"
          />
        )}
        {isMux &&
          mediaVideo?.__typename === 'MuxVideo' &&
          mediaVideo.playbackId != null && (
            <source
              src={`https://stream.mux.com/${mediaVideo.playbackId}.m3u8`}
              type="application/x-mpegURL"
            />
          )}
        {isInternal &&
          mediaVideo?.__typename === 'Video' &&
          mediaVideo.variant?.hls != null && (
            <source src={mediaVideo.variant.hls} type="application/x-mpegURL" />
          )}
      </video>
    </Box>
  )
}
