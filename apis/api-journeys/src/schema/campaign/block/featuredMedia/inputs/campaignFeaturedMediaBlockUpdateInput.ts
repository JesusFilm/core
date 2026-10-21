import { builder } from '../../../../builder'
import { CampaignFeaturedMediaLayout, CampaignMediaSide } from '../../../enums'
import { mediaSlotInputField } from '../../inputs/mediaSlotInput'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignFeaturedMediaBlockUpdateInput = builder.inputType(
  'CampaignFeaturedMediaBlockUpdateInput',
  {
    fields: (t) => ({
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
      mediaSide: t.field({ type: CampaignMediaSide, required: false }),
      layout: t.field({ type: CampaignFeaturedMediaLayout, required: false }),
      mediaBlockId: mediaSlotInputField(t),
      ...sectionStyleInputFields(t)
    })
  }
)
