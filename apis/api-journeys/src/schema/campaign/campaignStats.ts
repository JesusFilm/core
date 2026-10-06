import { builder } from '../builder'

import type {
  CampaignCountryStat,
  CampaignRegionStats,
  CampaignStats,
  CampaignStatsScope
} from './stats/campaignStats'

export const CampaignCountryStatRef = builder.objectRef<CampaignCountryStat>(
  'CampaignCountryStat'
)

builder.objectType(CampaignCountryStatRef, {
  description:
    'Visitors from one country. Codes are ISO alpha-2 exactly as Plausible reports them (so non-ISO codes such as `XK` and `A1` can appear); no names, the viewer labels with `Intl.DisplayNames`.',
  fields: (t) => ({
    countryCode: t.exposeString('countryCode', { nullable: false }),
    visitors: t.exposeInt('visitors', { nullable: false })
  })
})

export const CampaignStatsScopeRef =
  builder.objectRef<CampaignStatsScope>('CampaignStatsScope')

builder.objectType(CampaignStatsScopeRef, {
  description:
    'Campaign Stats summed over a scope: the whole campaign (landing, the ALL tab).',
  fields: (t) => ({
    totalVisitors: t.exposeInt('totalVisitors', {
      nullable: false,
      description:
        'Sum of per-journey unique visitors; includes visitors whose country is unknown.'
    }),
    countries: t.field({
      type: [CampaignCountryStatRef],
      nullable: false,
      description: 'Every known country by visitors, highest first.',
      resolve: (scope) => scope.countries
    })
  })
})

export const CampaignRegionStatsRef = builder.objectRef<CampaignRegionStats>(
  'CampaignRegionStats'
)

builder.objectType(CampaignRegionStatsRef, {
  description: 'Campaign Stats summed over one Campaign Region.',
  fields: (t) => ({
    regionId: t.exposeID('regionId', { nullable: false }),
    totalVisitors: t.exposeInt('totalVisitors', { nullable: false }),
    countries: t.field({
      type: [CampaignCountryStatRef],
      nullable: false,
      description: 'Every known country by visitors, highest first.',
      resolve: (region) => region.countries
    })
  })
})

export const CampaignStatsRef =
  builder.objectRef<CampaignStats>('CampaignStats')

builder.objectType(CampaignStatsRef, {
  description:
    "The visitor numbers a Campaign shows: each linked journey's unique visitors by country from the campaign's first publish to now, summed by the campaign's region and language structure.",
  fields: (t) => ({
    from: t.expose('from', {
      type: 'DateTimeISO',
      nullable: false,
      description:
        'The start of the stats window: the first publish (creation for a draft).'
    }),
    to: t.expose('to', {
      type: 'DateTimeISO',
      nullable: false,
      description: 'When the cached sweep was taken.'
    }),
    all: t.field({
      type: CampaignStatsScopeRef,
      nullable: false,
      resolve: (stats) => stats.all
    }),
    regions: t.field({
      type: [CampaignRegionStatsRef],
      nullable: false,
      description: 'Every region, listed and orphan alike, in region order.',
      resolve: (stats) => stats.regions
    })
  })
})
