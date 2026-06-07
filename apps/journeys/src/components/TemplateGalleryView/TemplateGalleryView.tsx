import Box from '@mui/material/Box'
import { ReactElement, useMemo } from 'react'

import {
  PublicGalleryPage,
  PublicGalleryPageData
} from '@core/journeys/ui/PublicGalleryPage'

import { GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPage'

interface TemplateGalleryViewProps {
  gallery: TemplateGalleryPage
}

function toData(gallery: TemplateGalleryPage): PublicGalleryPageData {
  return {
    title: gallery.title,
    description: gallery.description,
    creatorName: gallery.creatorName,
    creatorImageSrc: gallery.creatorImageSrc,
    creatorImageAlt: gallery.creatorImageAlt,
    mediaUrl: gallery.mediaUrl,
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
