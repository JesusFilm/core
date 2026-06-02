import Box from '@mui/material/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import Player from 'video.js/dist/types/player'

import { EmbedIframe } from '@core/journeys/ui/TemplateGalleryMedia'

import { GetTemplateGalleryPage_templateGalleryPageBySlug_media as TemplateGalleryPageMedia } from '../../../../__generated__/GetTemplateGalleryPage'
import { TemplateGalleryPageMediaType } from '../../../../__generated__/globalTypes'

interface TemplateGalleryMediaProps {
  media: TemplateGalleryPageMedia | null
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
export function TemplateGalleryMedia({
  media
}: TemplateGalleryMediaProps): ReactElement | null {
  if (media == null) return null

  if (media.type === TemplateGalleryPageMediaType.mux) {
    if (media.muxPlaybackId == null) return null
    return <MuxMedia playbackId={media.muxPlaybackId} />
  }

  if (media.type === TemplateGalleryPageMediaType.link) {
    if (media.embedUrl == null) return null
    return (
      <EmbedIframe
        embedUrl={media.embedUrl}
        title="Gallery media"
        borderRadius={4}
        testId="TemplateGalleryMedia"
      />
    )
  }

  // Exhaustiveness: a new media type added to the enum must be handled here
  // rather than silently falling into the link branch.
  return null
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
      bigPlayButton: true
    })
    return () => {
      playerRef.current?.dispose()
      playerRef.current = undefined
    }
  }, [])

  return (
    <Box data-testid="TemplateGalleryMedia" sx={{ borderRadius: 4, overflow: 'hidden' }}>
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
