import { CampaignRadius as PrismaCampaignRadius } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignRadius = builder.enumType(PrismaCampaignRadius, {
  name: 'CampaignRadius',
  description:
    'Corner radius of the Campaign Theme: square 0, slight 6, rounded 14, veryRounded 24 px.'
})
