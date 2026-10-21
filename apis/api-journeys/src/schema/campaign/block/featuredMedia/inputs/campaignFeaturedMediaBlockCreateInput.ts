import { builder } from '../../../../builder'
import { CampaignMediaSide } from '../../../enums'
import { SECTION_PARENT_BLOCK_ID_DESCRIPTION } from '../../createSection'

export const CampaignFeaturedMediaBlockCreateInput = builder.inputType(
  'CampaignFeaturedMediaBlockCreateInput',
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
      bullets: t.string({
        required: false,
        description: 'One bullet per line; at most 1000 characters.'
      }),
      mediaSide: t.field({
        type: CampaignMediaSide,
        required: false,
        description: 'Defaults to `right`.'
      })
    })
  }
)
