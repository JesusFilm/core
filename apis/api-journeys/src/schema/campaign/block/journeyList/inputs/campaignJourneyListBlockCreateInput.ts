import { builder } from '../../../../builder'
import { CampaignJourneyListDisplay } from '../../../enums'
import { SECTION_PARENT_BLOCK_ID_DESCRIPTION } from '../../createSection'

export const CampaignJourneyListBlockCreateInput = builder.inputType(
  'CampaignJourneyListBlockCreateInput',
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
      eyebrow: t.string({
        required: false,
        description: 'At most 80 characters.'
      }),
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      lede: t.string({
        required: false,
        description: 'At most 500 characters.'
      }),
      display: t.field({
        type: CampaignJourneyListDisplay,
        required: false,
        description: 'Defaults to grid.'
      })
    })
  }
)
