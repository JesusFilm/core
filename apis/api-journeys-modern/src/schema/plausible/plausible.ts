import { builder } from '../builder'

interface PlausibleStatsAggregateValue {
  value: number
  change?: number | null
}

interface PlausibleStatsAggregateResponse {
  visitors: PlausibleStatsAggregateValue
  visits: PlausibleStatsAggregateValue
  pageviews: PlausibleStatsAggregateValue
  viewsPerVisit: PlausibleStatsAggregateValue
  bounceRate: PlausibleStatsAggregateValue
  visitDuration: PlausibleStatsAggregateValue
  events: PlausibleStatsAggregateValue
  conversionRate: PlausibleStatsAggregateValue
  timeOnPage: PlausibleStatsAggregateValue
}

interface PlausibleStatsResponse {
  property: string
  visitors?: number | null
  visits?: number | null
  pageviews?: number | null
  viewsPerVisit?: number | null
  bounceRate?: number | null
  visitDuration?: number | null
  events?: number | null
  conversionRate?: number | null
  timeOnPage?: number | null
}

export const PlausibleStatsAggregateValueRef = builder
  .objectRef<PlausibleStatsAggregateValue>('PlausibleStatsAggregateValue')
  .implement({
    shareable: true,
    fields: (t) => ({
      value: t.float({
        nullable: false,
        resolve: (parent) => parent.value
      }),
      change: t.int({
        nullable: true,
        resolve: (parent) => parent.change
      })
    })
  })

export const PlausibleStatsAggregateResponseRef = builder
  .objectRef<PlausibleStatsAggregateResponse>('PlausibleStatsAggregateResponse')
  .implement({
    shareable: true,
    fields: (t) => ({
      visitors: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.visitors
      }),
      visits: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.visits
      }),
      pageviews: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.pageviews
      }),
      viewsPerVisit: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.viewsPerVisit
      }),
      bounceRate: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.bounceRate
      }),
      visitDuration: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.visitDuration
      }),
      events: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.events
      }),
      conversionRate: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.conversionRate
      }),
      timeOnPage: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.timeOnPage
      })
    })
  })

export const PlausibleStatsResponseRef = builder
  .objectRef<PlausibleStatsResponse>('PlausibleStatsResponse')
  .implement({
    shareable: true,
    fields: (t) => ({
      property: t.string({
        nullable: false,
        resolve: (parent) => parent.property
      }),
      visitors: t.int({
        nullable: true,
        resolve: (parent) => parent.visitors
      }),
      visits: t.int({
        nullable: true,
        resolve: (parent) => parent.visits
      }),
      pageviews: t.int({
        nullable: true,
        resolve: (parent) => parent.pageviews
      }),
      viewsPerVisit: t.float({
        nullable: true,
        resolve: (parent) => parent.viewsPerVisit
      }),
      bounceRate: t.int({
        nullable: true,
        resolve: (parent) => parent.bounceRate
      }),
      visitDuration: t.int({
        nullable: true,
        resolve: (parent) => parent.visitDuration
      }),
      events: t.int({
        nullable: true,
        resolve: (parent) => parent.events
      }),
      conversionRate: t.int({
        nullable: true,
        resolve: (parent) => parent.conversionRate
      }),
      timeOnPage: t.float({
        nullable: true,
        resolve: (parent) => parent.timeOnPage
      })
    })
  })
