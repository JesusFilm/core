import { CampaignJourneyRole as PrismaCampaignJourneyRole } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const CampaignJourneyRole = builder.enumType(PrismaCampaignJourneyRole, {
  name: 'CampaignJourneyRole',
  description:
    'Which list of a Campaign a journey belongs to. A journey has exactly one role per campaign.',
  values: {
    share: {
      description:
        'Powers the language share panel: non-template journeys the public page offers as ready-to-share links (one per language).'
    },
    template: {
      description:
        'Powers the customizable collection: template journeys a viewer can open in the template gallery and copy.'
    }
  }
})
