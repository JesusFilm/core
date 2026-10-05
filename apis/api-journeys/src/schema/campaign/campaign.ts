import { builder } from '../builder'
import { Language } from '../language'

import { CampaignBlock } from './block'
import { CampaignStatus } from './enums'
import { TranslatedValueRef, toTranslatedValues } from './translatedValue'

/**
 * The full admin shape of a Campaign, returned to team members by `campaign`,
 * `campaigns` and every campaign mutation. The anonymous public read arrives
 * with the public page tracer as a narrowed `CampaignPublic` projection.
 */
export const CampaignRef = builder.prismaObject('Campaign', {
  description:
    'A team-owned seasonal campaign site: a landing page plus one Region Page every Campaign Region renders, built from Campaign Blocks and pointing visitors at published Journeys. Draft or published like a Template Gallery Page; edited live in place.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    teamId: t.exposeID('teamId', { nullable: false }),
    team: t.relation('team', {
      nullable: false,
      description: 'Owning team; the campaign is hard-deleted with it.'
    }),
    title: t.exposeString('title', {
      nullable: false,
      description:
        'Default-language title; also the public page title. Required, at most 100 characters.'
    }),
    titleTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (campaign) => toTranslatedValues(campaign.titleTranslations)
    }),
    slug: t.exposeString('slug', {
      nullable: false,
      description:
        'Globally unique. The permanent Campaign Address is `/campaign/<slug>` on the root domain. Generated from the title; author-editable.'
    }),
    status: t.expose('status', { type: CampaignStatus, nullable: false }),
    defaultLanguageId: t.exposeID('defaultLanguageId', {
      nullable: false,
      description:
        'api-languages Language id; always one of `languages`. The default-language value of every Translated Field sits on the field itself.'
    }),
    defaultLanguage: t.field({
      type: Language,
      nullable: false,
      resolve: (campaign) => ({ id: campaign.defaultLanguageId })
    }),
    palette: t.exposeStringList('palette', {
      nullable: false,
      description:
        'The eight most recently used picker colours, newest first, `#RRGGBB` uppercase, no duplicates. Picker convenience; never read by the public page.'
    }),
    publishedAt: t.expose('publishedAt', {
      type: 'DateTimeISO',
      nullable: true,
      description:
        'First publish; never cleared by unpublish. Means "first went live", not "currently live".'
    }),
    createdAt: t.expose('createdAt', { type: 'DateTimeISO', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTimeISO', nullable: false }),
    languages: t.relation('languages', {
      nullable: false,
      description: 'Page Languages in selector order.',
      query: { orderBy: { order: 'asc' } }
    }),
    theme: t.relation('theme', {
      nullable: false,
      onNull: 'error',
      description: 'The one Campaign Theme row; created with the campaign.'
    }),
    pages: t.relation('pages', {
      nullable: false,
      description: 'Exactly the landing page and the Region Page.',
      query: { orderBy: { kind: 'asc' } }
    }),
    blocks: t.field({
      type: [CampaignBlock],
      nullable: false,
      description:
        'Every live Campaign Block of the campaign as one flat list (both pages, chrome, Region Lines, owned blocks), ordered by parentOrder; the client trees it by parentBlockId and partitions it by pageId / regionId.',
      select: {
        blocks: {
          where: { deletedAt: null },
          orderBy: [{ parentOrder: 'asc' }, { id: 'asc' }],
          include: { action: true }
        }
      },
      resolve: (campaign) => campaign.blocks
    }),
    regions: t.relation('regions', {
      nullable: false,
      description:
        'Every Campaign Region, listed and orphan, in switcher order.',
      query: { orderBy: { order: 'asc' } }
    }),
    strings: t.relation('strings', {
      nullable: false,
      description: 'The seventeen Campaign Strings.',
      query: { orderBy: { key: 'asc' } }
    })
  })
})
