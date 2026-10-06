import { builder } from '../../../../builder'

export const CampaignJourneyBlockUpdateInput = builder.inputType(
  'CampaignJourneyBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: 'Default-language title. At most 200 characters.'
      }),
      description: t.string({
        required: false,
        description: 'Default-language description. At most 1000 characters.'
      })
    })
  }
)
