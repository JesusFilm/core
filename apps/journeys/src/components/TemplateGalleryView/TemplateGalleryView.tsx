import Box from '@mui/material/Box'
import { ReactElement } from 'react'

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
      createdAt: template.createdAt,
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
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <PublicGalleryPage variant="journey" data={toData(gallery)} />
    </Box>
  )
}
