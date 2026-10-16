import { CampaignStringKey as PrismaCampaignStringKey } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignStringKey = builder.enumType(PrismaCampaignStringKey, {
  name: 'CampaignStringKey',
  description:
    'The fixed interface phrases every Campaign carries as Campaign Strings.'
})
