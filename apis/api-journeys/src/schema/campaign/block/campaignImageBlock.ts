import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignImageBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignImageBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignImageBlock',
  description:
    'The campaign image: one block in two roles. As an Image section (parentOrder set) it renders the picture full width with its space reserved from width and height; as an owned block (parentOrder null) it is a section’s background cover or the header logo, named by the parent’s coverBlockId or logoBlockId. `src` is an https imagedelivery.net address (the seeded default header logo is the one exception, served by the admin app); width and height are measured by the server.',
  fields: (t) => ({
    src: t.exposeString('src', {
      nullable: true,
      description:
        'The Cloudflare image address (`https://imagedelivery.net/…`), or the admin-hosted default header logo; null until an image is chosen.'
    }),
    alt: t.exposeString('alt', {
      nullable: true,
      description: 'Visitor-facing alternative text; at most 500 characters.'
    }),
    altTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.altTranslations)
    }),
    width: t.exposeInt('width', {
      nullable: true,
      description:
        'Measured by the server from the image; never client-supplied.'
    }),
    height: t.exposeInt('height', {
      nullable: true,
      description:
        'Measured by the server from the image; never client-supplied.'
    }),
    focalLeft: t.exposeInt('focalLeft', {
      nullable: true,
      description:
        'The focal point as a percentage from the left edge (0 to 100, 50 by default): the part of the picture kept in view wherever it is scaled to fill.'
    }),
    focalTop: t.exposeInt('focalTop', {
      nullable: true,
      description:
        'The focal point as a percentage from the top edge (0 to 100, 50 by default).'
    }),
    scale: t.exposeInt('scale', {
      nullable: true,
      description:
        'Zoom around the focal point as a percentage, 100 (none) to 200; null means none. Applied wherever the picture is scaled to fill.'
    })
  })
})
