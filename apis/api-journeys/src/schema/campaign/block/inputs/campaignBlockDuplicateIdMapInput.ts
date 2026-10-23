import { builder } from '../../../builder'

export const CampaignBlockDuplicateIdMapInput = builder.inputType(
  'CampaignBlockDuplicateIdMapInput',
  {
    description:
      'A client-chosen id for one block of the copy, so the editor can show the duplicate before the response arrives.',
    fields: (t) => ({
      oldId: t.id({ required: true }),
      newId: t.id({ required: true })
    })
  }
)
