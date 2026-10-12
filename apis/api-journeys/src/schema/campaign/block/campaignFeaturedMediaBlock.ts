import { builder } from '../../builder'
import { CampaignMediaSide } from '../enums'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignFeaturedMediaBlock = builder.prismaObject(
  'CampaignBlock',
  {
    variant: 'CampaignFeaturedMediaBlock',
    interfaces: [CampaignBlock, CampaignSectionBlock],
    isTypeOf: (block: any) => block.typename === 'CampaignFeaturedMediaBlock',
    description:
      'A section placing one Media Slot beside eyebrow, title, lede and bullets (one per line, split at render), the media on `mediaSide`. Media empty renders the text full width; text empty renders the media alone; both empty skips the section.',
    fields: (t) => ({
      eyebrow: t.exposeString('eyebrow', { nullable: true }),
      eyebrowTranslations: t.field({
        type: [TranslatedValueRef],
        nullable: false,
        resolve: (block) => toTranslatedValues(block.eyebrowTranslations)
      }),
      title: t.exposeString('title', { nullable: true }),
      titleTranslations: t.field({
        type: [TranslatedValueRef],
        nullable: false,
        resolve: (block) => toTranslatedValues(block.titleTranslations)
      }),
      lede: t.exposeString('lede', { nullable: true }),
      ledeTranslations: t.field({
        type: [TranslatedValueRef],
        nullable: false,
        resolve: (block) => toTranslatedValues(block.ledeTranslations)
      }),
      bullets: t.exposeString('bullets', {
        nullable: true,
        description: 'One bullet per line; the viewer splits on line breaks.'
      }),
      bulletsTranslations: t.field({
        type: [TranslatedValueRef],
        nullable: false,
        resolve: (block) => toTranslatedValues(block.bulletsTranslations)
      }),
      mediaSide: t.field({
        type: CampaignMediaSide,
        nullable: false,
        description: 'Which side the media sits on at `md` and up.',
        resolve: (block) => block.mediaSide ?? 'right'
      }),
      mediaBlockId: t.exposeID('mediaBlockId', {
        nullable: true,
        description:
          'The owned CampaignVideoBlock or CampaignImageBlock in the Media Slot.'
      })
    })
  }
)
