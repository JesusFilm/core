import { builder } from '../../../../builder'
import { CampaignFeaturedMediaLayout, CampaignMediaSide } from '../../../enums'
import { TEXT_CAPS } from '../../../validation'
import { mediaSlotInputField } from '../../inputs/mediaSlotInput'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignFeaturedMediaBlockUpdateInput = builder.inputType(
  'CampaignFeaturedMediaBlockUpdateInput',
  {
    fields: (t) => ({
      eyebrow: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.eyebrow} characters.`
      }),
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.title} characters.`
      }),
      description: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.description} characters.`
      }),
      bullets: t.string({
        required: false,
        description: `One bullet per line; at most ${TEXT_CAPS.bullets} characters.`
      }),
      mediaSide: t.field({ type: CampaignMediaSide, required: false }),
      layout: t.field({ type: CampaignFeaturedMediaLayout, required: false }),
      mediaBlockId: mediaSlotInputField(t),
      ...sectionStyleInputFields(t)
    })
  }
)
