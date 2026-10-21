import { builder } from '../../../../builder'
import { SECTION_PARENT_BLOCK_ID_DESCRIPTION } from '../../createSection'

export const CampaignRegionHeaderBlockCreateInput = builder.inputType(
  'CampaignRegionHeaderBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({
        required: true,
        description: 'The Region Page; refused on the landing page.'
      }),
      parentBlockId: t.id({
        required: false,
        description: SECTION_PARENT_BLOCK_ID_DESCRIPTION
      }),
      parentOrder: t.int({
        required: false,
        description:
          'Position among the page’s sections; appended when omitted or past the end.'
      }),
      intro: t.string({
        required: false,
        description: 'At most 500 characters.'
      })
    })
  }
)
