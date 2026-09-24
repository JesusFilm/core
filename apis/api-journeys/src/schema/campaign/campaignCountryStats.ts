import { builder } from '../builder'

import {
  CampaignCountryStat,
  CampaignCountryStats
} from './stats/getCampaignCountryStats'

export const CampaignCountryStatRef = builder
  .objectRef<CampaignCountryStat>('CampaignCountryStat')
  .implement({
    description:
      'Journey view counts for one country across a campaign, from Plausible.',
    fields: (t) => ({
      countryCode: t.exposeString('countryCode', {
        nullable: false,
        description: 'ISO 3166-1 alpha-2 code as reported by Plausible.'
      }),
      countryName: t.exposeString('countryName', {
        nullable: true,
        description:
          'English display name resolved server-side; null when the code is not recognised.'
      }),
      visitors: t.exposeInt('visitors', {
        nullable: false,
        description: 'Unique visitors (the product-facing "views" number).'
      }),
      pageviews: t.exposeInt('pageviews', {
        nullable: false,
        description: 'Total step pageviews.'
      })
    })
  })

export const CampaignCountryStatsRef = builder
  .objectRef<CampaignCountryStats>('CampaignCountryStats')
  .implement({
    description:
      "Country breakdown of a campaign's share-journey traffic, aggregated server-side from the owning team's Plausible site over `[from, to]`. Sorted by visitors descending.",
    fields: (t) => ({
      from: t.expose('from', { type: 'DateTimeISO', nullable: false }),
      to: t.expose('to', { type: 'DateTimeISO', nullable: false }),
      totalVisitors: t.exposeInt('totalVisitors', {
        nullable: false,
        description:
          'Sum of visitors over every row, including rows with an unknown country.'
      }),
      totalPageviews: t.exposeInt('totalPageviews', {
        nullable: false,
        description:
          'Sum of pageviews over every row, including rows with an unknown country.'
      }),
      countries: t.field({
        type: [CampaignCountryStatRef],
        nullable: false,
        resolve: (stats) => stats.countries
      })
    })
  })
