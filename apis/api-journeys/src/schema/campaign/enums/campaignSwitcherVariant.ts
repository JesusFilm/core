import { CampaignSwitcherVariant as PrismaCampaignSwitcherVariant } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignSwitcherVariant = builder.enumType(
  PrismaCampaignSwitcherVariant,
  {
    name: 'CampaignSwitcherVariant',
    description:
      'How a Region Switcher lists the regions: cards, a list, or pills.'
  }
)
