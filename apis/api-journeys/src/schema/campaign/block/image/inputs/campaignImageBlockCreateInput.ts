import { builder } from '../../../../builder'
import { CampaignImageSlot } from '../../../enums'

export const CampaignImageBlockCreateInput = builder.inputType(
  'CampaignImageBlockCreateInput',
  {
    description:
      'One of two roles: an Image section (`pageId`, optional `parentOrder`), or an owned image (`parentBlockId` and `slot`) that replaces the parent’s current cover, logo or media and gets `parentOrder: null`. Exactly one of `pageId` and `parentBlockId`.',
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({
        required: false,
        description: 'A page of the campaign; the Image section role.'
      }),
      parentOrder: t.int({
        required: false,
        description:
          'Section role only: position among the page’s sections; appended when omitted or past the end.'
      }),
      parentBlockId: t.id({
        required: false,
        description:
          'A section or chrome block of the campaign; the owned image role.'
      }),
      slot: t.field({
        type: CampaignImageSlot,
        required: false,
        description:
          'Owned role only: which slot of the parent this image fills. Defaults to `cover`; `logo` needs the header as parent, `media` a hero or Featured Media section.'
      }),
      src: t.string({
        required: false,
        description:
          'An https imagedelivery.net address. Width and height are measured by the server.'
      }),
      alt: t.string({
        required: false,
        description: 'At most 500 characters.'
      })
    })
  }
)
