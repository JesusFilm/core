import { builder } from '../../../../builder'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignVideoCarouselBlockUpdateInput = builder.inputType(
  'CampaignVideoCarouselBlockUpdateInput',
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
      description: t.string({
        required: false,
        description: 'At most 500 characters.'
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
