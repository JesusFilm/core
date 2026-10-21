import { builder } from '../../../../builder'
import { CampaignSwitcherVariant } from '../../../enums'
import { SECTION_PARENT_BLOCK_ID_DESCRIPTION } from '../../createSection'

export const CampaignRegionSwitcherBlockCreateInput = builder.inputType(
  'CampaignRegionSwitcherBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({ required: true, description: 'A page of the campaign.' }),
      parentBlockId: t.id({
        required: false,
        description: SECTION_PARENT_BLOCK_ID_DESCRIPTION
      }),
      parentOrder: t.int({
        required: false,
        description:
          'Position among the page’s sections; appended when omitted or past the end.'
      }),
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      variant: t.field({
        type: CampaignSwitcherVariant,
        required: false,
        description: 'Defaults to cards.'
      })
    })
  }
)
