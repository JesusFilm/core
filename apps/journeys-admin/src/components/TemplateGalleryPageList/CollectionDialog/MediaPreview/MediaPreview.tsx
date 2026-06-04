import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { EmbedIframe } from '@core/journeys/ui/TemplateGalleryMedia'

import { previewEmbedUrl } from '../CollectionPreviewPane/previewEmbedUrl'
import { CollectionMediaValues } from '../useCollectionForm/collectionMedia'

// Field box dimensions, matching the creator-image block (92×77) so the media
// field lines up with the Creator Details field.
export const MEDIA_BOX_WIDTH = 92
export const MEDIA_BOX_HEIGHT = 77

interface MediaPreviewProps {
  media: CollectionMediaValues
  /**
   * Compact variant for the media field's left box: placeholders render as a
   * plain grey box (no label) and empty media shows that box rather than
   * nothing. The full variant (the preview card) renders labelled placeholders
   * and nothing at all for empty media.
   */
  compact?: boolean
  /**
   * Fill the parent box (height 100%) rather than rendering at an intrinsic
   * 16:9. The Link box uses this to fill the whole 92×77 area with the preview
   * (no grey frame); the embed player letterboxes its own content inside.
   */
  fill?: boolean
}

/**
 * 16:9 media preview shared by the collection preview card and the media
 * field's left box, so the two can't drift. `mux` shows a letterboxed
 * thumbnail from the persisted playbackId; `link` shows an iframe for any URL
 * `previewEmbedUrl` accepts (YouTube normalized client-side, or an already
 * server-normalized Canva / Slides embed). Anything not yet previewable falls
 * back to a placeholder. The link URL is debounced so the iframe doesn't
 * reflow on every keystroke.
 */
export function MediaPreview({
  media,
  compact = false,
  fill = false
}: MediaPreviewProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const url = media.type === 'link' ? media.url : ''
  const [debouncedUrl, setDebouncedUrl] = useState(url)

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedUrl(url), 500)
    return () => clearTimeout(handle)
  }, [url])

  // Fill the parent box (fixed-size field) vs render at intrinsic 16:9 (card).
  const sizeSx = fill ? { height: '100%' } : { aspectRatio: '16 / 9' }

  if (
    media.type === 'mux' &&
    media.muxPlaybackId != null &&
    media.muxPlaybackId !== ''
  ) {
    return (
      // Letterbox the thumbnail in a 16:9 black frame, mirroring the public
      // page's video player: a portrait (or any non-16:9) video keeps the same
      // height as a landscape one and fills the sides with black bars.
      <Box
        sx={{
          width: '100%',
          ...sizeSx,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'common.black'
        }}
      >
        <Box
          component="img"
          data-testid="GalleryMediaPreviewThumbnail"
          src={`https://image.mux.com/${media.muxPlaybackId}/thumbnail.jpg`}
          alt={t('Video thumbnail')}
          sx={{
            width: '100%',
            height: '100%',
            // Fill mode is the fixed square upload box (match the creator image
            // — cover it); otherwise letterbox like the public player.
            objectFit: fill ? 'cover' : 'contain',
            display: 'block'
          }}
        />
      </Box>
    )
  }

  if (media.type === 'link') {
    const embedUrl = previewEmbedUrl(debouncedUrl)
    if (embedUrl != null) {
      return (
        <EmbedIframe
          embedUrl={embedUrl}
          title={t('Media preview')}
          borderRadius={1}
          testId="GalleryMediaPreview"
          fill={fill}
        />
      )
    }
  }

  // Compact (field box): a plain darker-grey box for every not-yet-previewable
  // state — empty, an in-flight upload, or a link being typed.
  if (compact) return <MediaPreviewPlaceholder dark sizeSx={sizeSx} />

  // Full (preview card): nothing for empty media, otherwise a labelled hint.
  if (media.type === 'none') return null
  const label =
    media.type === 'mux'
      ? t('Processing video…')
      : debouncedUrl.trim() !== ''
        ? t('Preview appears once you add the link')
        : t('Paste a link to see a preview')
  return <MediaPreviewPlaceholder label={label} />
}

function MediaPreviewPlaceholder({
  label,
  dark = false,
  sizeSx = { aspectRatio: '16 / 9' }
}: {
  label?: string
  dark?: boolean
  sizeSx?: { height: string } | { aspectRatio: string }
}): ReactElement {
  return (
    <Box
      data-testid="GalleryMediaPreviewPlaceholder"
      sx={{
        width: '100%',
        ...sizeSx,
        position: 'relative',
        borderRadius: 1,
        bgcolor: dark ? 'rgba(0,0,0,0.08)' : 'action.hover'
      }}
    >
      {label != null && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'text.secondary',
            px: 2
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  )
}
