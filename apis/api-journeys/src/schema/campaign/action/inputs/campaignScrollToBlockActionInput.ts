import { builder } from '../../../builder'

export const CampaignScrollToBlockActionInput = builder.inputType(
  'CampaignScrollToBlockActionInput',
  {
    fields: (t) => ({
      blockId: t.id({
        required: true,
        description: 'A live block of the same campaign.'
      })
    })
  }
)
