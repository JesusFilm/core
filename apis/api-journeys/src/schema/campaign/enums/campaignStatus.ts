import { CampaignStatus as PrismaCampaignStatus } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignStatus = builder.enumType(PrismaCampaignStatus, {
  name: 'CampaignStatus',
  description:
    'Lifecycle state of a Campaign. Anonymous traffic via `campaignBySlug` only sees `published` rows; drafts are hidden.',
  values: {
    draft: {
      description:
        'Hidden from the public renderer. All edit operations are allowed.'
    },
    published: {
      description:
        'Reachable at `/campaign/<slug>`. `campaignUpdate` remains allowed so a live campaign can be corrected in place.'
    }
  }
})
