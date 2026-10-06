import { CampaignBackgroundOverlay as PrismaCampaignBackgroundOverlay } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignBackgroundOverlay = builder.enumType(
  PrismaCampaignBackgroundOverlay,
  {
    name: 'CampaignBackgroundOverlay',
    description:
      'Overlay strength over an image Section Background: light 0.3, medium 0.55, heavy 0.75. Null means medium.'
  }
)
