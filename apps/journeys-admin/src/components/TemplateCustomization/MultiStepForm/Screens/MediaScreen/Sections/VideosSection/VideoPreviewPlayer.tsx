import Box from '@mui/material/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'

import VideoJsPlayer from '@core/journeys/ui/Video/utils/videoJsTypes'
import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import type { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { getVideoPoster } from '../../utils/videoSectionUtils'

import 'video.js/dist/video-js.css'
import 'videojs-mux'
import 'videojs-youtube'

interface VideoPreviewPlayerProps {
  videoBlock: VideoBlock
}

interface VideoSource {
  src: string
  type: string
}

/**
 * Returns the video.js source descriptor for a given video block, or null
 * when the block has no playable source.
 */
function getVideoSource(videoBlock: VideoBlock): VideoSource | null {
  const { source, mediaVideo, videoId } = videoBlock

  if (source === VideoBlockSource.youTube && videoId != null) {
    return {
      src: `https://www.youtube.com/watch?v=${videoId}`,
      type: 'video/youtube'
    }
  }

  if (
    source === VideoBlockSource.mux &&
    mediaVideo?.__typename === 'MuxVideo' &&
    mediaVideo.playbackId != null
  ) {
    return {
      src: `https://stream.mux.com/${mediaVideo.playbackId}.m3u8`,
      type: 'application/x-mpegURL'
    }
  }

  if (
    (source === VideoBlockSource.internal ||
      source === VideoBlockSource.cloudflare) &&
    mediaVideo?.__typename === 'Video' &&
    mediaVideo.variant?.hls != null
  ) {
    return {
      src: mediaVideo.variant.hls,
      type: 'application/x-mpegURL'
    }
  }

  return null
}

/**
 * Renders only the video player for a journey VideoBlock.
 * Supports YouTube, Mux, and internal (Video) sources via video.js.
 * No Select button, description, title, or duration overlay — video only.
 *
 * @remarks
 * The video element is created imperatively inside a container ref so that
 * video.js DOM mutations (wrapper divs, iframe replacement for YouTube) never
 * conflict with React's virtual DOM reconciliation.
 */
export function VideoPreviewPlayer({
  videoBlock
}: VideoPreviewPlayerProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<VideoJsPlayer | null>(null)

  const videoSource = getVideoSource(videoBlock)
  const videoSrc = videoSource?.src
  const videoType = videoSource?.type
  const poster = getVideoPoster(videoBlock)

  useEffect(() => {
    const container = containerRef.current
    if (container == null || videoSrc == null || videoType == null) return

    const videoEl = document.createElement('video')
    videoEl.classList.add('video-js', 'vjs-big-play-centered')
    videoEl.setAttribute('playsinline', '')

    container.appendChild(videoEl)

    playerRef.current = videojs(videoEl, {
      ...defaultVideoJsOptions,
      fluid: true,
      controls: true,
      poster,
      sources: [{ src: videoSrc, type: videoType }]
    }) as VideoJsPlayer

    return () => {
      if (playerRef.current != null && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [videoSrc, videoType, poster])

  // Unsupported source: render nothing (caller can hide section or show message)
  if (videoSource == null) {
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
      <Box ref={containerRef} />
    </Box>
  )
}
