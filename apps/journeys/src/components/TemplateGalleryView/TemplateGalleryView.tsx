import Box from '@mui/material/Box'
import { ReactElement, useMemo } from 'react'

import {
  PublicGalleryPage,
  PublicGalleryPageData,
  PublicGalleryPageMedia
} from '@core/journeys/ui/PublicGalleryPage'

import {
  GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage,
  GetTemplateGalleryPage_templateGalleryPageBySlug_media as TemplateGalleryPageMedia
} from '../../../__generated__/GetTemplateGalleryPage'
import { TemplateGalleryPageMediaType } from '../../../__generated__/globalTypes'

interface TemplateGalleryViewProps {
  gallery: TemplateGalleryPage
}

/**
 * Maps the generated media row to the lib's neutral tagged union. Rows whose
 * payload field is missing (a mux row without a playbackId, a link row
 * without an embedUrl) map to null so the media section simply doesn't
 * render rather than mounting a broken player/iframe.
 */
function toMedia(
  media: TemplateGalleryPageMedia | null
): PublicGalleryPageMedia | null {
  if (media == null) return null
  if (media.type === TemplateGalleryPageMediaType.mux) {
    if (media.muxPlaybackId == null) return null
    return { type: 'mux', muxPlaybackId: media.muxPlaybackId }
  }
  if (media.embedUrl == null) return null
  return { type: 'link', embedUrl: media.embedUrl }
}

function toData(gallery: TemplateGalleryPage): PublicGalleryPageData {
  return {
    title: gallery.title,
    description: gallery.description,
    creatorName: gallery.creatorName,
    creatorImageSrc: gallery.creatorImageSrc,
    creatorImageAlt: gallery.creatorImageAlt,
    media: toMedia(gallery.media),
    items: gallery.templates.map((template) => ({
      id: template.id,
      title: template.title,
      description: template.description,
      slug: template.slug,
      // String-coerce defensively: if Apollo ever returns a custom DateTime
      // scalar or a Date here, parseISO downstream silently yields Invalid
      // Date and the meta line drops the date without warning.
      createdAt: template.createdAt != null ? String(template.createdAt) : null,
      languageName: template.language.name,
      image:
        template.primaryImageBlock != null
          ? {
              src: template.primaryImageBlock.src,
              alt: template.primaryImageBlock.alt
            }
          : null
    }))
  }
}

export function TemplateGalleryView({
  gallery
}: TemplateGalleryViewProps): ReactElement {
  // Memoise the mapped view-model so a React.memo wrapper around children
  // would actually benefit; a fresh object every render is the default.
  const data = useMemo(() => toData(gallery), [gallery])
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <PublicGalleryPage variant="journey" data={data} />
    </Box>
  )
}
