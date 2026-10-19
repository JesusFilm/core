import { builder } from '../builder'
import { Language } from '../language'
import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  getJourneyPublicUrl
} from './getJourneyPublicUrl'

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
      journeyUrl: t.string({
        nullable: true,
        description:
          "Where the linked journey is served, as the viewer receives it: the journey team's route-all custom domain, else a collection domain holding it, else the root domain. Null for an Unlinked Language.",
        select: { journey: { include: INCLUDE_JOURNEY_PUBLIC_URL } },
        resolve: (regionLanguage) =>
          regionLanguage.journey == null
            ? null
            : getJourneyPublicUrl(regionLanguage.journey)
      }),
      title: t.exposeString('title', {
        nullable: true,
        description:
          "Snapshot of the linked journey's title; the journey's own language, not translated."
      }),
      description: t.exposeString('description', { nullable: true }),
      snapshotEdited: t.exposeBoolean('snapshotEdited', {
        nullable: false,
        description:
          'True once an author changed the snapshot title or description by hand, so "Refresh from journey" asks before replacing them. Linking, unlinking and refreshing from the journey clear it.'
      }),
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
