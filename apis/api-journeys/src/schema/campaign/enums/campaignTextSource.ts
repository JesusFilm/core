import { CampaignTextSource as PrismaCampaignTextSource } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignTextSource = builder.enumType(PrismaCampaignTextSource, {
  name: 'CampaignTextSource',
  description: 'Who wrote a translation: a person or the machine-translation sweep.'
})
