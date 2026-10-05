import { builder } from '../builder'
import { Language } from '../language'

export const CampaignRegionLanguageRef = builder.prismaObject(
  'CampaignRegionLanguage',
  {
    description:
      'A Share Language of a Campaign Region: which journey the region hands out in that language, with the Campaign QR Code created the moment a journey is linked. An Unlinked Language has no journey yet.',
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      regionId: t.exposeID('regionId', { nullable: false }),
      languageId: t.exposeID('languageId', {
        nullable: false,
        description: 'api-languages Language id.'
      }),
      language: t.field({
        type: Language,
        nullable: false,
        resolve: (regionLanguage) => ({ id: regionLanguage.languageId })
      }),
      journeyId: t.exposeID('journeyId', { nullable: true }),
      journey: t.relation('journey', { nullable: true }),
      title: t.exposeString('title', {
        nullable: true,
        description:
          "Snapshot of the linked journey's title; the journey's own language, not translated."
      }),
      description: t.exposeString('description', { nullable: true }),
      qrCodeId: t.exposeID('qrCodeId', { nullable: true }),
      qrCode: t.relation('qrCode', {
        nullable: true,
        description:
          'The Campaign QR Code, present from the moment a journey is linked; its short link is the Share Link.'
      }),
      order: t.exposeInt('order', { nullable: false })
    })
  }
)
