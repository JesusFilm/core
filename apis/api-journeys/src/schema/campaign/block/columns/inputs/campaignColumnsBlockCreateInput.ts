import { builder } from '../../../../builder'
import { CampaignColumnsRatio } from '../../../enums'
import { SECTION_PARENT_BLOCK_ID_DESCRIPTION } from '../../createSection'

export const CampaignColumnsBlockCreateInput = builder.inputType(
  'CampaignColumnsBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({ required: true, description: 'A page of the campaign.' }),
      parentBlockId: t.id({
        required: false,
        description: `${SECTION_PARENT_BLOCK_ID_DESCRIPTION} A Columns section never sits in a slot, so a value here is always refused.`
      }),
      parentOrder: t.int({
        required: false,
        description:
          'Position among the page’s sections; appended when omitted or past the end.'
      }),
      ratio: t.field({
        type: CampaignColumnsRatio,
        required: false,
        description: 'Defaults to equal.'
      }),
      slotIds: t.idList({
        required: false,
        description:
          'Client-chosen ids for the two Column Slots, in order, so the editor can show them before the response arrives; exactly two when given.'
      })
    })
  }
)
