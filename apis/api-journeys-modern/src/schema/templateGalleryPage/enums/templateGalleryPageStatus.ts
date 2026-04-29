import { TemplateGalleryPageStatus as PrismaTemplateGalleryPageStatus } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const TemplateGalleryPageStatus = builder.enumType(
  PrismaTemplateGalleryPageStatus,
  {
    name: 'TemplateGalleryPageStatus'
  }
)
