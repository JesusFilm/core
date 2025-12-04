import { goals } from '../../workers/plausible/service'
import { builder } from '../builder'

export interface PlausibleStatsAggregateValue {
  value: number
  change?: number | null
}

export interface PlausibleStatsAggregateResponse {
  visitors?: PlausibleStatsAggregateValue
  visits?: PlausibleStatsAggregateValue
  pageviews?: PlausibleStatsAggregateValue
  viewsPerVisit?: PlausibleStatsAggregateValue
  bounceRate?: PlausibleStatsAggregateValue
  visitDuration?: PlausibleStatsAggregateValue
  events?: PlausibleStatsAggregateValue
  conversionRate?: PlausibleStatsAggregateValue
  timeOnPage?: PlausibleStatsAggregateValue
}

export interface PlausibleStatsResponse {
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

export interface TemplateFamilyStatsEventResponse {
  event:
    | (typeof goals)[number]
    | 'chatsClicked'
    | 'linksClicked'
    | 'journeyVisitors'
    | 'journeyResponses'
  visitors: number
}

export interface TemplateFamilyStatsBreakdownResponse {
  journeyId: string
  journeyName: string
  teamName: string
  stats: TemplateFamilyStatsEventResponse[]
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
        nullable: true,
        description: 'The number of unique visitors.',
        resolve: (parent) => parent.visitors
      }),
      visits: t.field({
        type: PlausibleStatsAggregateValueRef,
        nullable: true,
        description: 'The number of visits/sessions.',
        resolve: (parent) => parent.visits
      }),
      pageviews: t.field({
        type: PlausibleStatsAggregateValueRef,
        nullable: true,
        description: 'The number of pageview events.',
        resolve: (parent) => parent.pageviews
      }),
      viewsPerVisit: t.field({
        type: PlausibleStatsAggregateValueRef,
        nullable: true,
        description:
          'The number of pageviews divided by the number of visits. Returns a floating point number. Currently only supported in Aggregate and Timeseries endpoints.',
        resolve: (parent) => parent.viewsPerVisit
      }),
      bounceRate: t.field({
        type: PlausibleStatsAggregateValueRef,
        nullable: true,
        description: 'Bounce rate percentage.',
        resolve: (parent) => parent.bounceRate
      }),
      visitDuration: t.field({
        type: PlausibleStatsAggregateValueRef,
        nullable: true,
        description: 'Visit duration in seconds.',
        resolve: (parent) => parent.visitDuration
      }),
      events: t.field({
        type: PlausibleStatsAggregateValueRef,
        nullable: true,
        description:
          'The number of events (pageviews + custom events). When filtering by a goal, this metric corresponds to "Total Conversions" in the dashboard.',
        resolve: (parent) => parent.events
      }),
      conversionRate: t.field({
        type: PlausibleStatsAggregateValueRef,
        nullable: true,
        description:
          'The percentage of visitors who completed the goal. Requires an `event:goal` filter or `event:goal` property in the breakdown endpoint.',
        resolve: (parent) => parent.conversionRate
      }),
      timeOnPage: t.field({
        type: PlausibleStatsAggregateValueRef,
        nullable: true,
        description:
          'The average time users spend on viewing a single page. Requires an `event:page` filter or `event:page` property in the breakdown endpoint.',
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
        description:
          'On breakdown queries, this is the property that was broken down by. On aggregate queries, this is the date the stats are for.',
        resolve: (parent) => parent.property
      }),
      visitors: t.int({
        nullable: true,
        description: 'The number of unique visitors.',
        resolve: (parent) => parent.visitors
      }),
      visits: t.int({
        nullable: true,
        description: 'The number of visits/sessions.',
        resolve: (parent) => parent.visits
      }),
      pageviews: t.int({
        nullable: true,
        description: 'The number of pageview events.',
        resolve: (parent) => parent.pageviews
      }),
      viewsPerVisit: t.float({
        nullable: true,
        description:
          'The number of pageviews divided by the number of visits. Returns a floating point number. Currently only supported in Aggregate and Timeseries endpoints.',
        resolve: (parent) => parent.viewsPerVisit
      }),
      bounceRate: t.int({
        nullable: true,
        description: 'Bounce rate percentage.',
        resolve: (parent) => parent.bounceRate
      }),
      visitDuration: t.int({
        nullable: true,
        description: 'Visit duration in seconds.',
        resolve: (parent) => parent.visitDuration
      }),
      events: t.int({
        nullable: true,
        description:
          'The number of events (pageviews + custom events). When filtering by a goal, this metric corresponds to "Total Conversions" in the dashboard.',
        resolve: (parent) => parent.events
      }),
      conversionRate: t.int({
        nullable: true,
        description:
          'The percentage of visitors who completed the goal. Requires an `event:goal` filter or `event:goal` property in the breakdown endpoint.',
        resolve: (parent) => parent.conversionRate
      }),
      timeOnPage: t.float({
        nullable: true,
        description:
          'The average time users spend on viewing a single page. Requires an `event:page` filter or `event:page` property in the breakdown endpoint.',
        resolve: (parent) => parent.timeOnPage
      })
    })
  })

export const TemplateFamilyStatsEventResponseRef = builder
  .objectRef<TemplateFamilyStatsEventResponse>(
    'TemplateFamilyStatsEventResponse'
  )
  .implement({
    shareable: true,
    fields: (t) => ({
      event: t.string({
        nullable: false,
        resolve: (parent) => parent.event as string
      }),
      visitors: t.int({
        nullable: false,
        resolve: (parent) => parent.visitors
      })
    })
  })

export const TemplateFamilyStatsBreakdownResponseRef = builder
  .objectRef<TemplateFamilyStatsBreakdownResponse>(
    'TemplateFamilyStatsBreakdownResponse'
  )
  .implement({
    shareable: true,
    fields: (t) => ({
      journeyId: t.string({
        nullable: false,
        resolve: (parent) => parent.journeyId
      }),
      journeyName: t.string({
        nullable: false,
        resolve: (parent) => parent.journeyName
      }),
      teamName: t.string({
        nullable: false,
        resolve: (parent) => parent.teamName
      }),
      stats: t.field({
        type: [TemplateFamilyStatsEventResponseRef],
        nullable: false,
        resolve: (parent) => parent.stats
      })
    })
  })
