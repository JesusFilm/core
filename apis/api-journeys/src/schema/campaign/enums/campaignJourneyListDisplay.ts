import { CampaignJourneyListDisplay as PrismaCampaignJourneyListDisplay } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignJourneyListDisplay = builder.enumType(
  PrismaCampaignJourneyListDisplay,
  {
    name: 'CampaignJourneyListDisplay',
    description: 'How a Journey List renders its items: a card grid or a list.'
  }
)
