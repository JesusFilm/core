import { CampaignButtonRadius as PrismaCampaignButtonRadius } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignButtonRadius = builder.enumType(PrismaCampaignButtonRadius, {
  name: 'CampaignButtonRadius',
  description: 'Button corner shape of the Campaign Theme.'
})
