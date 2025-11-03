import difference from 'lodash/difference'
import {
  GraphQLQuery,
  GraphQLVariables,
  HttpResponse,
  RequestHandler,
  graphql,
  http
} from 'msw'

import { goals } from './plausible.service'

const journeySiteId = 'api-journeys-journey-journeyId'
const teamSiteId = 'api-journeys-team-teamId'

const mockAxiosError = new HttpResponse(null, {
  status: 404,
  statusText: 'Mock request failed due to a mismatch of params'
})

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

export const siteCreate = graphql.mutation<GraphQLQuery, GraphQLVariables>(
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

export const getRealTimeVisitorsResponse = 10

export const getRealTimeVisitors = (): RequestHandler =>
  http.get(
    `${process.env.PLAUSIBLE_URL}/api/v1/stats/realtime/visitors`,
    async ({ request }) => {
      const url = new URL(request.url)
      const siteId = url.searchParams.get('site_id')

      if (siteId === journeySiteId || siteId === teamSiteId)
        return HttpResponse.json(getRealTimeVisitorsResponse)
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Mock request failed due to a mismatch of params'
      })
    }
  ) as RequestHandler

export const getStatsAggregateResponse = {
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

export const getStatsAggregate = (): RequestHandler =>
  http.get(
    `${process.env.PLAUSIBLE_URL}/api/v1/stats/aggregate`,
    async ({ request }) => {
      const url = new URL(request.url)
      const siteId = url.searchParams.get('site_id')
      const metrics = url.searchParams.get('metrics')

      if (
        (siteId === journeySiteId || siteId === teamSiteId) &&
        metrics === 'metrics'
      )
        return HttpResponse.json(getStatsAggregateResponse)
      return mockAxiosError
    }
  )

export const getStatsBreakdownResponse = {
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

export const getStatsBreakdown = (): RequestHandler =>
  http.get(
    `${process.env.PLAUSIBLE_URL}/api/v1/stats/breakdown`,
    async ({ request }) => {
      const url = new URL(request.url)
      const siteId = url.searchParams.get('site_id')
      const property = url.searchParams.get('property')
      const metrics = url.searchParams.get('metrics')

      if (
        (siteId === journeySiteId || siteId === teamSiteId) &&
        property === 'property' &&
        metrics === 'metrics'
      )
        return HttpResponse.json(getStatsBreakdownResponse)
      return mockAxiosError
    }
  )

export const getStatsTimeseriesResponse = {
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

export const getStatsTimeseries = (): RequestHandler =>
  http.get(
    `${process.env.PLAUSIBLE_URL}/api/v1/stats/timeseries`,
    async ({ request }) => {
      const url = new URL(request.url)
      const siteId = url.searchParams.get('site_id')
      const metrics = url.searchParams.get('metrics')

      if (
        (siteId === journeySiteId || siteId === teamSiteId) &&
        metrics === 'metrics'
      )
        return HttpResponse.json(getStatsTimeseriesResponse)
      return mockAxiosError
    }
  )
