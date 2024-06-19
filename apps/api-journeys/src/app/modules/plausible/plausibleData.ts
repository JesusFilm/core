import difference from 'lodash/difference'
import {
  GraphQLQuery,
  GraphQLVariables,
  HttpResponse,
  RequestHandler,
  graphql,
  http
} from 'msw'

import {
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '.prisma/api-journeys-client'

import { goals } from './plausible.service'

export const team = {
  __typename: 'Team',
  id: 'team.id',
  publicTitle: 'title',
  createAt: '2021-02-18T00:00:00Z',
  updateAt: '2021-02-18T00:00:00Z',
  userTeams: [],
  customDomains: [],
  plausibleToken: 'token'
}

export const journey: Journey = {
  id: 'journey.id',
  slug: 'journey-slug',
  title: 'published',
  status: JourneyStatus.published,
  languageId: '529',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  description: null,
  creatorDescription: null,
  creatorImageBlockId: null,
  primaryImageBlockId: null,
  teamId: 'teamId',
  publishedAt: new Date('2021-11-19T12:34:56.647Z'),
  createdAt: new Date('2021-11-19T12:34:56.647Z'),
  updatedAt: new Date('2021-11-19T12:34:56.647Z'),
  archivedAt: null,
  trashedAt: null,
  featuredAt: null,
  deletedAt: null,
  seoTitle: null,
  seoDescription: null,
  template: false,
  hostId: null,
  strategySlug: null,
  plausibleToken: null
}

export const MOCK_GATEWAY_URL = 'http://127.0.0.1:4000'
export const MOCK_PLAUSIBLE_URL = 'http://localhost:8000'
const journeySiteId = 'api-journeys-journey-journey.id'
const teamSiteId = 'api-journeys-team-team.id'
const mockAxiosError = new HttpResponse(null, {
  status: 404,
  statusText: 'Mock request failed due to a mismatch of params'
})

// SiteCreate
export const siteCreateResponse = {
  data: {
    siteCreate: {
      data: {
        id: 'site.id',
        domain: 'site-name',
        goals,
        memberships: [
          {
            id: 'siteMember.id',
            role: 'admin'
          }
        ],
        sharedLinks: [
          {
            id: 'sharedLink.id',
            slug: 'site-slug'
          }
        ]
      }
    }
  }
}
const siteCreate = graphql.mutation<GraphQLQuery, GraphQLVariables>(
  'SiteCreate',
  ({ variables }) => {
    const domainVar = variables.input.domain
    const goalsVar = variables.input.goals

    if (
      domainVar !== 'site-name' ||
      difference(goals, [...goalsVar]).length > 0
    ) {
      return HttpResponse.json({
        errors: [{ message: 'Mock request failed due to a mismatch of params' }]
      })
    }

    return HttpResponse.json(siteCreateResponse)
  }
)

// RealTimeVisitors
export const realTimeVisitorsJourneyResponse = 10
export const realTimeVisitorsTeamResponse = 20
const realTimeVisitors = http.get(
  `${MOCK_PLAUSIBLE_URL}/api/v1/stats/realtime/visitors`,
  async ({ request }) => {
    const url = new URL(request.url)
    const siteId = url.searchParams.get('site_id')

    if (siteId === journeySiteId) {
      return HttpResponse.json(realTimeVisitorsJourneyResponse)
    } else if (siteId === teamSiteId) {
      return HttpResponse.json(realTimeVisitorsTeamResponse)
    } else {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Mock request failed due to a mismatch of params'
      })
    }
  }
) as RequestHandler

// StatsAggregate
export const statsAggregateJourneyResponse = {
  results: {
    visitors: { value: 4 },
    visits: { value: 4 },
    pageviews: { value: 4 },
    viewsPerVisit: { value: 4 },
    bounceRate: { value: 4 },
    visitDuration: { value: 4 },
    events: { value: 4 },
    conversionRate: { value: 4 },
    timeOnPage: { value: 4 }
  }
}
export const statsAggregateTeamResponse = { ...statsAggregateJourneyResponse }
const statsAggregate = http.get(
  `${MOCK_PLAUSIBLE_URL}/api/v1/stats/aggregate`,
  async ({ request }) => {
    const url = new URL(request.url)
    const siteId = url.searchParams.get('site_id')
    const metrics = url.searchParams.get('metrics')

    if (siteId === journeySiteId && metrics === 'metrics') {
      return HttpResponse.json(statsAggregateJourneyResponse)
    } else if (siteId === teamSiteId && metrics === 'metrics') {
      return HttpResponse.json(statsAggregateTeamResponse)
    } else {
      return mockAxiosError
    }
  }
) as RequestHandler

// StatsBreakdown
export const statsBreakdownJourneyResponse = {
  results: [
    {
      property: 'property',
      visitors: 10,
      visits: 10,
      pageviews: 10,
      viewsPerVisit: 10,
      bounceRate: 10,
      visitDuration: 10,
      events: 10,
      conversionRate: 10,
      timeOnPage: 10
    }
  ]
}
export const statsBreakdownTeamResponse = { ...statsBreakdownJourneyResponse }
const statsBreakdown = http.get(
  `${MOCK_PLAUSIBLE_URL}/api/v1/stats/breakdown`,
  async ({ request }) => {
    const url = new URL(request.url)
    const siteId = url.searchParams.get('site_id')
    const property = url.searchParams.get('property')
    const metrics = url.searchParams.get('metrics')

    if (
      siteId === journeySiteId &&
      property === 'property' &&
      metrics === 'metrics'
    ) {
      return HttpResponse.json(statsBreakdownJourneyResponse)
    } else if (
      siteId === teamSiteId &&
      property === 'property' &&
      metrics === 'metrics'
    ) {
      return HttpResponse.json(statsBreakdownTeamResponse)
    } else {
      return mockAxiosError
    }
  }
) as RequestHandler

// StatsTimeseries
export const statsTimeseriesJourneyResponse = {
  results: [
    {
      property: 'property',
      visitors: 10,
      visits: 10,
      pageviews: 10,
      viewsPerVisit: 10,
      bounceRate: 10,
      visitDuration: 10,
      events: 10,
      conversionRate: 10,
      timeOnPage: 10
    }
  ]
}
export const statsTimeSeriesTeamResponse = { ...statsTimeseriesJourneyResponse }
const statsTimeseries = http.get(
  `${MOCK_PLAUSIBLE_URL}/api/v1/stats/timeseries`,
  async ({ request }) => {
    const url = new URL(request.url)
    const siteId = url.searchParams.get('site_id')
    const metrics = url.searchParams.get('metrics')

    if (siteId === journeySiteId && metrics === 'metrics') {
      return HttpResponse.json(statsTimeseriesJourneyResponse)
    } else if (siteId === teamSiteId && metrics === 'metrics') {
      return HttpResponse.json(statsTimeSeriesTeamResponse)
    } else {
      return mockAxiosError
    }
  }
) as RequestHandler

export const handlers = [
  siteCreate,
  realTimeVisitors,
  statsAggregate,
  statsBreakdown,
  statsTimeseries
]
