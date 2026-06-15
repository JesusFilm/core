import { ApolloError } from '@apollo/client'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import {
  EmbedIframe,
  isValidMuxPlaybackId
} from '@core/journeys/ui/TemplateGalleryMedia'

import { TemplateGalleryPageMediaType } from '../../../../../__generated__/globalTypes'
import { useTemplateGalleryPageEmbedPreview } from '../../../../libs/useTemplateGalleryPageEmbedPreview'
import { CollectionMediaValues } from '../useCollectionForm/collectionMedia'
import { mediaErrorMessage } from '../useCollectionForm/mediaErrorMessage'

// Field box dimensions, shared with the Creator Details image box so the two
// fields line up. Gently landscape (≈8:7), and tall enough that the right-hand
// column can stack its text above its action button (e.g. Remove) without the
// row looking lopsided.
export const MEDIA_BOX_WIDTH = 140
export const MEDIA_BOX_HEIGHT = 112

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
   * 16:9. The Link box uses this to fill the whole MEDIA_BOX-sized area with
   * the preview (no grey frame); the embed player letterboxes its own content
   * inside.
   */
  fill?: boolean
}

/**
 * 16:9 media preview shared by the collection preview card and the media
 * field's left box, so the two can't drift. `mux` shows a letterboxed
 * thumbnail from the persisted playbackId; `link` resolves the pasted URL on
 * the server (`templateGalleryPageEmbedPreview`, the same normalizer the save
 * path runs) and shows the returned embed — a wave shimmer while it resolves,
 * and the inline `mediaErrorMessage` for the provider's reason on failure, so
 * the preview matches exactly what a save would store. The URL is debounced so
 * the query doesn't fire on every keystroke.
 */
export function MediaPreview({
  media,
  compact = false,
  fill = false
}: MediaPreviewProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const url = media.type === TemplateGalleryPageMediaType.link ? media.url : ''
  const [debouncedUrl, setDebouncedUrl] = useState(url)

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedUrl(url), 500)
    return () => clearTimeout(handle)
  }, [url])

  // Resolve the pasted link to its embed URL on the server — the SAME
  // validation + normalization the save path runs (linkValidate) — so the
  // preview can never diverge from what a save would store, and provider
  // errors (private YouTube, unavailable Canva, unpublished Slides, disallowed
  // host) surface inline before saving. Skipped for non-link / empty /
  // non-https input (see the hook).
  const { data, loading, error } =
    useTemplateGalleryPageEmbedPreview(debouncedUrl)
  const resolvedEmbedUrl = data?.templateGalleryPageEmbedPreview ?? null

  // Fill the parent box (fixed-size field) vs render at intrinsic 16:9 (card).
  const sizeSx = fill ? { height: '100%' } : { aspectRatio: '16 / 9' }

  if (
    media.type === TemplateGalleryPageMediaType.mux &&
    media.muxPlaybackId != null &&
    isValidMuxPlaybackId(media.muxPlaybackId)
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
          bgcolor: 'common.black',
          position: 'relative'
        }}
      >
        {/* key resets the loaded state when the video changes, so a stale
            thumbnail never shows while the new one fetches. */}
        <MuxThumbnail
          key={media.muxPlaybackId}
          src={`https://image.mux.com/${media.muxPlaybackId}/thumbnail.jpg`}
          alt={t('Video thumbnail')}
          // Fill mode is the fixed field box (match the creator image — cover
          // it); otherwise letterbox like the public player.
          objectFit={fill ? 'cover' : 'contain'}
        />
      </Box>
    )
  }

  if (media.type === TemplateGalleryPageMediaType.link) {
    // Resolved → render the embed. key resets the loaded state when the URL
    // changes, so editing the link re-shimmers instead of showing the stale
    // embed's last frame.
    if (resolvedEmbedUrl != null) {
      return (
        <LinkPreview key={resolvedEmbedUrl} embedUrl={resolvedEmbedUrl} fill={fill} />
      )
    }
    // Resolving → a wave shimmer (compact keeps the plain box; the card reads
    // as "working", not broken).
    if (loading) {
      if (compact) return <MediaPreviewPlaceholder dark sizeSx={sizeSx} />
      return (
        <Skeleton
          data-testid="GalleryMediaPreviewResolving"
          variant="rectangular"
          animation="wave"
          sx={{ width: '100%', ...sizeSx, borderRadius: 1 }}
        />
      )
    }
    // Failed validation → the provider's inline message (compact keeps the
    // plain box; the field-level save error still covers the compact field).
    if (error != null) {
      if (compact) return <MediaPreviewPlaceholder dark sizeSx={sizeSx} />
      return (
        <MediaPreviewPlaceholder
          label={mediaErrorMessage(embedPreviewReason(error), t)}
        />
      )
    }
    // else (skipped: empty or non-https) → the placeholder below.
  }

  // Compact (field box): a plain darker-grey box for every not-yet-previewable
  // state — empty, an in-flight upload, or a link being typed.
  if (compact) return <MediaPreviewPlaceholder dark sizeSx={sizeSx} />

  // Full (preview card): nothing for empty media, otherwise a labelled hint.
  if (media.type === TemplateGalleryPageMediaType.none) return null
  if (media.type === TemplateGalleryPageMediaType.mux) {
    // Reaches here only when there's no renderable thumbnail. A pending upload
    // (carries a videoId) is genuinely processing; an empty slot is idle, so
    // promise the upload rather than implying work is happening.
    const hasUpload =
      media.muxVideoId !== '' ||
      (media.muxPlaybackId != null && media.muxPlaybackId !== '')
    return (
      <MediaPreviewPlaceholder
        label={
          hasUpload
            ? t('Processing video…')
            : t('Your uploaded video will appear here')
        }
      />
    )
  }
  const label =
    debouncedUrl.trim() !== ''
      ? t('Preview appears once you add the link')
      : t('Paste a link to see a preview')
  return <MediaPreviewPlaceholder label={label} />
}

/**
 * Pulls the structured `reason` off the preview query's GraphQLError, mirroring
 * the save path's error reader so the same `mediaErrorMessage` map applies.
 * Falls back to an empty string (→ the generic message) when no reason is
 * present (e.g. a not-https `BAD_USER_INPUT`).
 */
function embedPreviewReason(error: ApolloError): string {
  const raw = error.graphQLErrors.find(
    (e) => typeof e.extensions?.reason === 'string'
  )?.extensions?.reason
  return typeof raw === 'string' ? raw : ''
}

/**
 * Link embed with a loading shimmer: a skeleton sits behind the iframe
 * (transparent until its document paints) and unmounts once the iframe's
 * `load` event fires — so re-mounts (e.g. tab switches) shimmer instead of
 * flashing an empty box, without leaving a wave animation running forever
 * behind the loaded embed.
 */
function LinkPreview({
  embedUrl,
  fill
}: {
  embedUrl: string
  fill: boolean
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [loaded, setLoaded] = useState(false)
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        ...(fill && { height: '100%' })
      }}
    >
      {!loaded && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            inset: 0,
            height: '100%',
            borderRadius: 1
          }}
        />
      )}
      <EmbedIframe
        embedUrl={embedUrl}
        title={t('Media preview')}
        borderRadius={1}
        testId="GalleryMediaPreview"
        fill={fill}
        onLoad={() => setLoaded(true)}
      />
    </Box>
  )
}

/**
 * Mux thumbnail with a loading shimmer: a skeleton fills the frame until the
 * image's `load` event fires, so re-mounts (e.g. switching the Link/Upload
 * tab) shimmer instead of flashing an empty black box while the thumbnail
 * re-fetches. A failed fetch (Mux may 404 the still while the asset is
 * processing) stops the shimmer and falls back to the parent's black
 * letterbox rather than animating forever. The parent letterbox supplies
 * `position: relative`.
 */
function MuxThumbnail({
  src,
  alt,
  objectFit
}: {
  src: string
  alt: string
  objectFit: 'cover' | 'contain'
}): ReactElement {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  return (
    <>
      {!loaded && !failed && (
        <Skeleton
          data-testid="GalleryMediaPreviewSkeleton"
          variant="rectangular"
          animation="wave"
          sx={{ position: 'absolute', inset: 0, height: '100%' }}
        />
      )}
      <Box
        component="img"
        data-testid="GalleryMediaPreviewThumbnail"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        sx={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
          // Keep the element mounted while loading (so `load` fires) but
          // invisible under the skeleton — and keep a failed fetch's broken
          // image glyph hidden too.
          opacity: loaded ? 1 : 0
        }}
      />
    </>
  )
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
