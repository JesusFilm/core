import { TemplateGalleryPageMediaType as PrismaTemplateGalleryPageMediaType } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const TemplateGalleryPageMediaType = builder.enumType(
  PrismaTemplateGalleryPageMediaType,
  {
    name: 'TemplateGalleryPageMediaType',
    description:
      'Discriminator for the media attached to a TemplateGalleryPage. Determines which underlying fields are populated.',
    values: {
      link: {
        description:
          'An embeddable URL (Canva, YouTube, Google Slides, or an allowlisted host). `embedUrl` is populated; the Mux fields are null.'
      },
      mux: {
        description:
          'A Mux video upload. `muxPlaybackId` is populated; `embedUrl` is null.'
      }
    }
  }
)
