import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { JourneyPlausibleEvents } from '@core/journeys/ui/plausibleHelpers'

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
  // 'shareCapture',
  'rsvpCapture',
  'inviteFriendCapture',
  'custom1Capture',
  'custom2Capture',
  'custom3Capture',
  // 'custom4Capture',
  // 'custom5Capture'
  'specialVideoStartCapture',
  'specialVideoCompleteCapture'
]

@Injectable()
export class PlausibleService {
  constructor(
    @InjectQueue('api-journeys-plausible')
    private readonly plausibleQueue: Queue<PlausibleJob>,
    private readonly prismaService: PrismaService
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

  async createSites(): Promise<void> {
    console.log('creating team sites...')
    const chunkedTeamIds = chunk(
      (
        await this.prismaService.team.findMany({
          where: { plausibleToken: null },
          select: { id: true }
        })
      ).map(({ id }) => id),
      5
    )

    for await (const teamIds of chunkedTeamIds) {
      await Promise.all(
        teamIds.map(async (teamId) => await this.createTeamSite({ teamId }))
      )
    }

    console.log('creating journey sites...')
    const chunkedJourneyIds = chunk(
      (
        await this.prismaService.journey.findMany({
          where: { plausibleToken: null },
          select: { id: true }
        })
      ).map(({ id }) => id),
      5
    )

    for await (const journeyIds of chunkedJourneyIds) {
      await Promise.all(
        journeyIds.map(
          async (journeyId) => await this.createJourneySite({ journeyId })
        )
      )
    }

    // TODO: we may want another way to check all the templates that still needs sites
    console.log('creating template sites...')
    const chunkedTemplateIds = chunk(
      (
        await this.prismaService.journey.findMany({
          where: { template: true },
          select: { id: true }
        })
      ).map(({ id }) => id),
      5
    )

    for await (const templateIds of chunkedTemplateIds) {
      await Promise.allSettled(
        templateIds.map(
          async (templateId) => await this.createTemplateSite({ templateId })
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

  async createTemplateSite({
    templateId
  }: {
    templateId: string
  }): Promise<void> {
    try {
      await this.createSite(this.templateSiteId(templateId), true)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('domain already exists')
      ) {
        return
      }
      throw error
    }
  }

  async createSite(
    domain: string,
    disableSharedLinks = false
  ): Promise<MutationSiteCreateResult | undefined> {
    const { data } = await this.client.mutate({
      mutation: SITE_CREATE,
      variables: {
        input: {
          domain,
          goals: goals as string[],
          disableSharedLinks
        }
      }
    })
    return data?.siteCreate
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

  private templateSiteId(templateId: string): string {
    return `api-journeys-template-${templateId}`
  }
}
