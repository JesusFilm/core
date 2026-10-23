import { CampaignStatus as PrismaCampaignStatus } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignStatus = builder.enumType(PrismaCampaignStatus, {
  name: 'CampaignStatus',
  description:
    'Lifecycle state of a Campaign. Status is the only public gate: a draft is never served, a published campaign is served as it is right now.'
})
