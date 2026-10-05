import { CampaignChildPlacement as PrismaCampaignChildPlacement } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignChildPlacement = builder.enumType(PrismaCampaignChildPlacement, {
  name: 'CampaignChildPlacement',
  description: 'Which side of the Section Body an Extra renders on.'
})
