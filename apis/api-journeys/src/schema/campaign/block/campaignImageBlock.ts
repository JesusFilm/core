import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignImageBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignImageBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignImageBlock',
  description:
    'The campaign image: one block in two roles. As an Image section (parentOrder set) it renders the picture full width with its space reserved from width and height; as an owned block (parentOrder null) it is a section’s background cover or the header logo, named by the parent’s coverBlockId or logoBlockId. `src` is always an https imagedelivery.net address; width and height are measured by the server.',
  fields: (t) => ({
    src: t.exposeString('src', {
      nullable: true,
      description:
        'The Cloudflare image address (`https://imagedelivery.net/…`); null until an image is chosen.'
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
      description: 'Measured by the server from the image; never client-supplied.'
    }),
    height: t.exposeInt('height', {
      nullable: true,
      description: 'Measured by the server from the image; never client-supplied.'
    })
  })
})
