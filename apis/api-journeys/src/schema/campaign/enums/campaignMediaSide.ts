import { CampaignMediaSide as PrismaCampaignMediaSide } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignMediaSide = builder.enumType(PrismaCampaignMediaSide, {
  name: 'CampaignMediaSide',
  description: 'Which side of a Featured Media section the Media Slot renders on.'
})
