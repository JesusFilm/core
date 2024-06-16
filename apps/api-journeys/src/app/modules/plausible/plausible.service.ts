import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject
} from '@apollo/client'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'
import { GraphQLError } from 'graphql'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import last from 'lodash/last'
import reduce from 'lodash/reduce'

import { JourneyPlausibleEvents } from '@core/journeys/ui/plausibleHelpers'

import { gql } from '../../../__generated__'
import { MutationSiteCreateResult } from '../../../__generated__/graphql'
import {
  PlausibleStatsAggregateFilter,
  PlausibleStatsAggregateResponse,
  PlausibleStatsBreakdownFilter,
  PlausibleStatsResponse,
  PlausibleStatsTimeseriesFilter
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { PlausibleJob } from './plausible.consumer'

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

  constructor(
    @InjectQueue('api-journeys-plausible')
    private readonly plausibleQueue: Queue<PlausibleJob>,
    private readonly prismaService: PrismaService
  ) {}

  async onModuleInit(): Promise<void> {
    this.client = new ApolloClient({
      link: new HttpLink({
        uri: process.env.GATEWAY_URL,
        fetch,
        headers: {
          Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`
        }
      }),
      cache: new InMemoryCache()
    })
    await this.plausibleQueue.add('plausibleCreateSites', {
      __typename: 'plausibleCreateSites'
    })
  }

  async createSites(): Promise<void> {
    console.log('creating team sites...')
    while (true) {
      const teams = await this.prismaService.team.findMany({
        where: { plausibleToken: null },
        select: { id: true },
        take: 100
      })
      if (teams.length === 0) break
      await Promise.all(
        teams.map(
          async ({ id: teamId }) => await this.createTeamSite({ teamId })
        )
      )
    }

    console.log('creating journey sites...')
    while (true) {
      const journeys = await this.prismaService.journey.findMany({
        where: { plausibleToken: null },
        select: { id: true },
        take: 100
      })
      if (journeys.length === 0) break
      await Promise.all(
        journeys.map(
          async ({ id: journeyId }) =>
            await this.createJourneySite({ journeyId })
        )
      )
    }
  }

  async createJourneySite({ journeyId }: { journeyId: string }): Promise<void> {
    const site = await this.createSite(this.journeySiteId(journeyId))
    if (site == null || site.__typename !== 'MutationSiteCreateSuccess') return
    await this.prismaService.journey.update({
      where: { id: journeyId },
      data: {
        plausibleToken: site.data.sharedLinks[0].slug
      }
    })
  }

  async createTeamSite({ teamId }: { teamId: string }): Promise<void> {
    const site = await this.createSite(this.teamSiteId(teamId))
    if (site == null || site.__typename !== 'MutationSiteCreateSuccess') return
    await this.prismaService.team.update({
      where: { id: teamId },
      data: {
        plausibleToken: site.data.sharedLinks[0].slug
      }
    })
  }

  async getStatsRealtimeVisitors(
    id: string,
    type: 'journey' | 'team'
  ): Promise<number> {
    const domain =
      type === 'journey' ? this.journeySiteId(id) : this.teamSiteId(id)
    const response = await this.client.get<number>(
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
      const response = await this.client.get<{
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
      const response = await this.client.get<{
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
      const response = await this.client.get<{
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

  async createSite(
    domain: string
  ): Promise<MutationSiteCreateResult | undefined> {
    const goals: Array<keyof JourneyPlausibleEvents> = [
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
      'videoTrigger'
    ]

    const { data } = await this.client.mutate({
      mutation: gql(`
        mutation SiteCreate($input: SiteCreateInput!) {
          siteCreate(input: $input) {
            ... on Error {
              message
              __typename
            }
            ... on MutationSiteCreateSuccess {
              data {
                id
                domain
                __typename
                memberships {
                  id
                  role
                  __typename
                }
                goals {
                  id
                  eventName
                  __typename
                }
                sharedLinks {
                  id
                  slug
                  __typename
                }
              }
            }
          }
        }
      `),
      variables: {
        input: {
          domain,
          goals: goals as string[]
        }
      }
    })
    return data?.siteCreate
  }

  private journeySiteId(journeyId: string): string {
    return `api-journeys-journey-${journeyId}`
  }

  private teamSiteId(teamId: string): string {
    return `api-journeys-team-${teamId}`
  }
}
