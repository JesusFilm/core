import { builder } from '../../../../builder'
import { CampaignColumnsRatio } from '../../../enums'
import {
  SECTION_PARENT_BLOCK_ID_DESCRIPTION,
  sectionCreateInputFields
} from '../../inputs/sectionCreateInput'

export const CampaignColumnsBlockCreateInput = builder.inputType(
  'CampaignColumnsBlockCreateInput',
  {
    fields: (t) => ({
      ...sectionCreateInputFields(t, {
        parentBlockId: `${SECTION_PARENT_BLOCK_ID_DESCRIPTION} A Columns section never sits in a slot, so a value here is always refused.`
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
