import Box from '@mui/material/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import Player from 'video.js/dist/types/player'

import { EmbedIframe } from '../../TemplateGalleryMedia'
import { PublicGalleryPageMedia } from '../galleryTokens'

interface JourneyViewMediaProps {
  media?: PublicGalleryPageMedia | null
}

/**
 * Public renderer for a gallery page's embedded media. Dispatches on
 * `media.type`: `mux` renders a video.js HLS player from the denormalized
 * `muxPlaybackId`; `link` renders the server-normalized `embedUrl` in an
 * iframe whose `allow`/`sandbox`/aspect-ratio attributes are derived from the
 * URL host (YouTube, Canva, Google Slides — see `embedAttrs`). Legacy rows
 * (no `media` row, only the deprecated `mediaUrl` scalar) arrive as `null` and
 * render nothing.
 */
export function JourneyViewMedia({
  media
}: JourneyViewMediaProps): ReactElement | null {
  if (media == null) return null

  if (media.type === 'mux') {
    // Keyed so a playbackId change remounts the player — video.js only
    // reads the <source> at init (the effect has no deps), so an in-place
    // re-render with a different id would silently keep the old stream.
    return <MuxMedia key={media.muxPlaybackId} playbackId={media.muxPlaybackId} />
  }

  return (
    <EmbedIframe
      embedUrl={media.embedUrl}
      title="Gallery media"
      borderRadius={4}
      testId="TemplateGalleryMedia"
    />
  )
}

function MuxMedia({ playbackId }: { playbackId: string }): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | undefined>(undefined)

  useEffect(() => {
    if (videoRef.current == null) return
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      responsive: true,
      bigPlayButton: true,
      // Force a 16:9 frame so a portrait upload letterboxes inside it rather
      // than making the player tall.
      aspectRatio: '16:9'
    })
    return () => {
      playerRef.current?.dispose()
      playerRef.current = undefined
    }
  }, [])

  return (
    <Box
      data-testid="TemplateGalleryMedia"
      sx={{ borderRadius: 4, overflow: 'hidden' }}
    >
      <video
        data-testid="TemplateGalleryMediaMux"
        ref={videoRef}
        className="video-js vjs-tech"
        playsInline
      >
        <source
          src={`https://stream.mux.com/${playbackId}.m3u8`}
          type="application/x-mpegURL"
        />
      </video>
    </Box>
  )
}
