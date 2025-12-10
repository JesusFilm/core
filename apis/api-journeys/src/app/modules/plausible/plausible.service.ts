import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink
} from '@apollo/client'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { Queue } from 'bullmq'
import { GraphQLError } from 'graphql'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import last from 'lodash/last'
import reduce from 'lodash/reduce'

import { JourneyPlausibleEvents } from '@core/journeys/ui/plausibleHelpers'

import {
  PlausibleStatsAggregateFilter,
  PlausibleStatsAggregateResponse,
  PlausibleStatsBreakdownFilter,
  PlausibleStatsResponse,
  PlausibleStatsTimeseriesFilter
} from '../../__generated__/graphql'

const FIVE_DAYS = 5 * 24 * 60 * 60 // in seconds

interface PlausibleCreateTeamSiteJob {
  __typename: 'plausibleCreateTeamSite'
  teamId: string
}

interface PlausibleCreateJourneySiteJob {
  __typename: 'plausibleCreateJourneySite'
  journeyId: string
}

interface PlausibleCreateSitesJob {
  __typename: 'plausibleCreateSites'
}

export type PlausibleJob =
  | PlausibleCreateTeamSiteJob
  | PlausibleCreateJourneySiteJob
  | PlausibleCreateSitesJob

export const goals: Array<keyof JourneyPlausibleEvents> = [
  'footerThumbsUpButtonClick',
  'footerThumbsDownButtonClick',
  'shareButtonClick',
  'pageview',
  'navigatePreviousStep',
  'navigateNextStep',
  'buttonClick',
  'chatButtonClick',
  'footerChatButtonClick',
  'radioQuestionSubmit',
  'signUpSubmit',
  'textResponseSubmit',
  'videoPlay',
  'videoPause',
  'videoExpand',
  'videoCollapse',
  'videoStart',
  'videoProgress25',
  'videoProgress50',
  'videoProgress75',
  'videoComplete',
  'videoTrigger',
  // Capture events are triggered by journey events above
  'prayerRequestCapture',
  'christDecisionCapture',
  'gospelStartCapture',
  'gospelCompleteCapture',
  'shareCapture',
  'rsvpCapture',
  'inviteFriendCapture',
  'custom1Capture',
  'custom2Capture',
  'custom3Capture',
  'custom4Capture',
  'custom5Capture'
]

interface PlausibleAPIStatsBreakdownResponse extends PlausibleAPIStatsResponse {
  [key: string]: unknown
}

interface PlausibleAPIStatsTimeseriesResponse
  extends PlausibleAPIStatsResponse {
  date: string
}

interface PlausibleAPIStatsResponse {
  visitors?: number
  visits?: number
  pageviews?: number
  views_per_visit?: number
  bounce_rate?: number
  visit_duration?: number
  events?: number
  conversion_rate?: number
  time_on_page?: number
}

interface PlausibleAPIStatsAggregateResponse {
  visitors?: { value: number; change?: number }
  visits?: { value: number; change?: number }
  pageviews?: { value: number; change?: number }
  views_per_visit?: { value: number; change?: number }
  bounce_rate?: { value: number; change?: number }
  visit_duration?: { value: number; change?: number }
  events?: { value: number; change?: number }
  conversion_rate?: { value: number; change?: number }
  time_on_page?: { value: number; change?: number }
}

@Injectable()
export class PlausibleService implements OnModuleInit {
  client: ApolloClient<NormalizedCacheObject>
  plausibleClient: AxiosInstance

  constructor(
    @InjectQueue('api-journeys-plausible')
    private readonly plausibleQueue: Queue<PlausibleJob>
  ) {
    const httpLink = createHttpLink({
      uri: process.env.GATEWAY_URL,
      fetch,
      headers: {
        Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
        'x-graphql-client-name': 'api-journeys',
        'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
      }
    })
    this.client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    this.plausibleClient = axios.create({
      baseURL: process.env.PLAUSIBLE_URL,
      headers: {
        Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`
      }
    })
  }

  async onModuleInit(): Promise<void> {
    await this.plausibleQueue.add(
      'plausibleCreateSites',
      {
        __typename: 'plausibleCreateSites'
      },
      {
        removeOnComplete: true,
        removeOnFail: { age: FIVE_DAYS, count: 50 }
      }
    )
  }

  async getStatsRealtimeVisitors(
    id: string,
    type: 'journey' | 'team'
  ): Promise<number> {
    const domain =
      type === 'journey' ? this.journeySiteId(id) : this.teamSiteId(id)

    const response = await this.plausibleClient.get<number>(
      `/api/v1/stats/realtime/visitors`,
      {
        params: {
          site_id: domain
        }
      }
    )

    return response.data
  }

  async getStatsAggregate(
    id: string,
    type: 'journey' | 'team',
    params: {
      metrics: string
    } & PlausibleStatsAggregateFilter
  ): Promise<PlausibleStatsAggregateResponse> {
    const domain =
      type === 'journey' ? this.journeySiteId(id) : this.teamSiteId(id)
    try {
      const response = await this.plausibleClient.get<{
        results: PlausibleAPIStatsAggregateResponse
      }>(`/api/v1/stats/aggregate`, {
        params: {
          site_id: domain,
          ...params
        }
      })
      const accumulator: PlausibleStatsAggregateResponse = {}
      return reduce(
        response.data.results,
        (acc, value, key) => {
          if (value != null) acc[camelCase(key)] = value
          return acc
        },
        accumulator
      )
    } catch (error) {
      const message = get(error, 'response.data.error')
      if (typeof message === 'string')
        throw new GraphQLError(message, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      throw error
    }
  }

  async getStatsBreakdown(
    id: string,
    type: 'journey' | 'team',
    params: {
      metrics: string
    } & PlausibleStatsBreakdownFilter
  ): Promise<PlausibleStatsResponse[]> {
    const domain =
      type === 'journey' ? this.journeySiteId(id) : this.teamSiteId(id)
    try {
      const response = await this.plausibleClient.get<{
        results: PlausibleAPIStatsBreakdownResponse[]
      }>(`/api/v1/stats/breakdown`, {
        params: {
          site_id: domain,
          ...params
        }
      })

      const propertyKey = last(params.property.split(':') ?? []) ?? ''
      return response.data.results.map((result) => {
        const accumulator: PlausibleStatsResponse = {
          property: result[propertyKey] as string
        }
        return reduce(
          result,
          (acc, value, key) => {
            if (key !== propertyKey) acc[camelCase(key)] = value
            return acc
          },
          accumulator
        )
      })
    } catch (error) {
      const message = get(error, 'response.data.error')
      if (typeof message === 'string')
        throw new GraphQLError(message, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      throw error
    }
  }

  async getStatsTimeseries(
    id: string,
    type: 'journey' | 'team',
    params: {
      metrics: string
    } & PlausibleStatsTimeseriesFilter
  ): Promise<PlausibleStatsResponse[]> {
    const domain =
      type === 'journey' ? this.journeySiteId(id) : this.teamSiteId(id)
    try {
      const response = await this.plausibleClient.get<{
        results: PlausibleAPIStatsTimeseriesResponse[]
      }>(`/api/v1/stats/timeseries`, {
        params: {
          site_id: domain,
          ...params
        }
      })

      return response.data.results.map((result) => {
        const accumulator: PlausibleStatsResponse = {
          property: result.date
        }
        return reduce(
          result,
          (acc, value, key) => {
            if (key !== 'date') acc[camelCase(key)] = value ?? 0
            return acc
          },
          accumulator
        )
      })
    } catch (error) {
      const message = get(error, 'response.data.error')
      if (typeof message === 'string')
        throw new GraphQLError(message, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      throw error
    }
  }

  private journeySiteId(journeyId: string): string {
    return `api-journeys-journey-${journeyId}`
  }

  private teamSiteId(teamId: string): string {
    return `api-journeys-team-${teamId}`
  }
}
