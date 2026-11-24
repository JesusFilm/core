import { CampaignFeaturedMediaLayout as PrismaCampaignFeaturedMediaLayout } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignFeaturedMediaLayout = builder.enumType(
  PrismaCampaignFeaturedMediaLayout,
  {
    name: 'CampaignFeaturedMediaLayout',
    description:
      'How a Featured Media section arranges its text and Media Slot: side by side, or stacked with the media full width under the text.'
  }
)
