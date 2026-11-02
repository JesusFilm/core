import { CampaignBackgroundKind as PrismaCampaignBackgroundKind } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignBackgroundKind = builder.enumType(
  PrismaCampaignBackgroundKind,
  {
    name: 'CampaignBackgroundKind',
    description:
      'What a Campaign Section sits on. Named kinds are theme-slot references; `custom` reads the section backgroundColor; `image` reads the owned cover block.'
  }
)
