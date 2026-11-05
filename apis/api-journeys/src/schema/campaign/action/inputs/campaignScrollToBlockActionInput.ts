import { builder } from '../../../builder'

export const CampaignScrollToBlockActionInput = builder.inputType(
  'CampaignScrollToBlockActionInput',
  {
    fields: (t) => ({
      blockId: t.id({
        required: true,
        description:
          'A section of the button’s page (a header or footer button may name a section of either page).'
      })
    })
  }
)
