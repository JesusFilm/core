import { builder } from '../../../../builder'

export const CampaignJourneyBlockCreateInput = builder.inputType(
  'CampaignJourneyBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({
        required: false,
        description: 'A client-chosen id for the new item.'
      }),
      parentBlockId: t.id({
        required: true,
        description: 'The journey list the card is added to.'
      }),
      url: t.string({
        required: true,
        description: 'The journey’s admin link or public URL on any domain.'
      })
    })
  }
)
