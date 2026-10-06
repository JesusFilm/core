import { CampaignPageKind as PrismaCampaignPageKind } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignPageKind = builder.enumType(PrismaCampaignPageKind, {
  name: 'CampaignPageKind',
  description:
    'One of the two pages every Campaign has: the landing page, or the Region Page that every Campaign Region renders.'
})
