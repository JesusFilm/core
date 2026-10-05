import { CampaignColumnsRatio as PrismaCampaignColumnsRatio } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignColumnsRatio = builder.enumType(PrismaCampaignColumnsRatio, {
  name: 'CampaignColumnsRatio',
  description: 'The width ratio of the two Column Slots of a Columns section.'
})
