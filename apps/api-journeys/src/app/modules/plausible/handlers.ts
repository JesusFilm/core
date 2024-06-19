import difference from 'lodash/difference'
import { HttpResponse, RequestHandler, graphql, http } from 'msw'

const siteCreate = graphql.mutation('SiteCreate', ({ variables }) => {
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

  return HttpResponse.json(response)
})

const realTimeVisitors = http.get(
  `${process.env.PLAUSIBLE_URL}/api/v1/stats/realtime/visitors`,
  async ({ request }) => {
    const url = new URL(request.url as string)
    const siteId = url.searchParams.get('site_id')

    if (siteId === journeySiteId) {
      return HttpResponse.json(journeyResponse)
    } else if (siteId === teamSiteId) {
      return HttpResponse.json(teamResponse)
    } else {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Mock request failed due to a mismatch of params'
      })
    }
  }
) as RequestHandler

const statsAggregate = http.get(
  `${process.env.PLAUSIBLE_URL}/api/v1/stats/aggregate`,
  async ({ request }) => {
    const url = new URL(request.url as string)
    const siteId = url.searchParams.get('site_id')
    const metrics = url.searchParams.get('metrics')

    if (siteId === journeySiteId && metrics === 'metrics') {
      return HttpResponse.json(journeyResponse)
    } else if (siteId === teamSiteId && metrics === 'metrics') {
      return HttpResponse.json(teamResponse)
    } else {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Mock request failed due to a mismatch of params'
      })
    }
  }
) as RequestHandler

const statsBreakdown = http.get(
  `${process.env.PLAUSIBLE_URL}/api/v1/stats/breakdown`,
  async ({ request }) => {
    const url = new URL(request.url as string)
    const siteId = url.searchParams.get('site_id')
    const property = url.searchParams.get('property')
    const metrics = url.searchParams.get('metrics')

    if (
      siteId === journeySiteId &&
      property === 'property' &&
      metrics === 'metrics'
    ) {
      return HttpResponse.json(journeyResponse)
    } else if (
      siteId === teamSiteId &&
      property === 'property' &&
      metrics === 'metrics'
    ) {
      return HttpResponse.json(teamResponse)
    } else {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Mock request failed due to a mismatch of params'
      })
    }
  }
) as RequestHandler

const statsTimeseries = http.get(
  `${process.env.PLAUSIBLE_URL}/api/v1/stats/timeseries`,
  async ({ request }) => {
    const url = new URL(request.url as string)
    const siteId = url.searchParams.get('site_id')
    const metrics = url.searchParams.get('metrics')

    if (siteId === journeySiteId && metrics === 'metrics') {
      return HttpResponse.json(journeyResponse)
    } else if (siteId === teamSiteId && metrics === 'metrics') {
      return HttpResponse.json(teamResponse)
    } else {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Mock request failed due to a mismatch of params'
      })
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
