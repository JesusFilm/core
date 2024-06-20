import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject
} from '@apollo/client'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

import { JourneyPlausibleEvents } from '@core/journeys/ui/plausibleHelpers'

import { gql } from '../../../__generated__'
import { MutationSiteCreateResult } from '../../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { PlausibleJob } from './plausible.consumer'

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
