import { builder } from '../../../builder'

export const CampaignNavigateToRegionActionInput = builder.inputType(
  'CampaignNavigateToRegionActionInput',
  {
    fields: (t) => ({
      regionId: t.id({
        required: true,
        description: 'A Campaign Region of the same campaign.'
      })
    })
  }
)
