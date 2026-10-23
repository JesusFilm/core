import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignVideoCarouselBlockUpdateInput = builder.inputType(
  'CampaignVideoCarouselBlockUpdateInput',
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
      url: t.string({
        required: false,
        description:
          'A pasted Watch address: resolved by the server through its variant slug to a Video of any label, which becomes `videoId` (Watch expansion). Not together with `videoId`.'
      }),
      videoId: t.id({
        required: false,
        description:
          'A published Watch Video id (Watch expansion), or null for explicit mode (the ordered CampaignVideoBlock children). Omitted leaves the mode alone.'
      }),
      videoVariantLanguageId: t.id({
        required: false,
        description:
          'With `url` or `videoId`: the language the expansion resolves in; defaults to the language the pasted address named, else the campaign language.'
      }),
      ...sectionStyleInputFields(t)
    })
  }
)
