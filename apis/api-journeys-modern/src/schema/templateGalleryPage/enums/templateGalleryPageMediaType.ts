import { TemplateGalleryPageMediaType as PrismaTemplateGalleryPageMediaType } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const TemplateGalleryPageMediaType = builder.enumType(
  PrismaTemplateGalleryPageMediaType,
  {
    name: 'TemplateGalleryPageMediaType',
    description:
      'Active selector for the media attached to a TemplateGalleryPage: which payload renders. Both payload slots may stay populated regardless of this value, so switching never discards a payload.',
    values: {
      link: {
        description: 'Render the embed URL (`embedUrl`).'
      },
      mux: {
        description: 'Render the Mux upload (`muxPlaybackId`).'
      },
      none: {
        description:
          'Render nothing. Any stored `embedUrl`/upload payload is retained but not shown; the public page treats this as no media.'
      }
    }
  }
)
