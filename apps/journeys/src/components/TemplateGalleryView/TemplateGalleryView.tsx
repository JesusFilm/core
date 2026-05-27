import { ReactElement } from 'react'

import type { PublicGalleryPageData } from '@core/journeys/ui/PublicGalleryPage'
import { PublicTemplateGallery } from '@core/journeys/ui/PublicTemplateGallery'

import { GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPage'

interface TemplateGalleryViewProps {
  gallery: TemplateGalleryPage
}

/** Maps the public GraphQL page DTO onto the shared gallery contract. */
function toGalleryData(gallery: TemplateGalleryPage): PublicGalleryPageData {
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
      createdAt: template.createdAt != null ? String(template.createdAt) : null,
      languageName: template.language.name.map(({ value, primary }) => ({
        value,
        primary
      })),
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
  return <PublicTemplateGallery data={toGalleryData(gallery)} />
}
