import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { Queue } from 'bullmq'

import { JourneyPlausibleEvents } from '@core/journeys/ui/plausibleHelpers'

import { PrismaService } from '../../lib/prisma.service'

import { PlausibleJob } from './plausible.consumer'

@Injectable()
export class PlausibleService implements OnModuleInit {
  constructor(
    @InjectQueue('api-journeys-plausible')
    private readonly plausibleQueue: Queue<PlausibleJob>,
    private readonly prismaService: PrismaService
  ) {}

  client: AxiosInstance
  async onModuleInit(): Promise<void> {
    this.client = axios.create({
      baseURL: process.env.PLAUSIBLE_URL,
      headers: {
        Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`
      }
    })
    const jobs = await this.plausibleQueue.getJobs([
      'wait',
      'failed',
      'delayed'
    ])
    for (const job of jobs) {
      if (
        job.id != null &&
        (job.name === 'plausibleCreateJourneySite' ||
          job.name === 'plausibleCreateTeamSite')
      ) {
        await this.plausibleQueue.remove(job.id)
      }
    }

    const journeys = await this.prismaService.journey.findMany({
      where: { plausibleToken: null }
    })
    await Promise.all(
      journeys.map(async (journey) => {
        await this.plausibleQueue.add('plausibleCreateJourneySite', {
          __typename: 'plausibleCreateJourneySite',
          journeyId: journey.id
        })
        await this.plausibleQueue.add('plausibleCreateTeamSite', {
          __typename: 'plausibleCreateTeamSite',
          teamId: journey.teamId
        })
      })
    )
  }

  async createJourneySite({ journeyId }: { journeyId: string }): Promise<void> {
    const domain = this.journeySiteId(journeyId)
    await this.client.post('/api/v1/sites', {
      domain
    })
    await this.createGoals(domain)
    await this.prismaService.journey.update({
      where: { id: journeyId },
      data: {
        plausibleToken: await this.createSharedLink(domain)
      }
    })
  }

  async createTeamSite({ teamId }: { teamId: string }): Promise<void> {
    const domain = this.teamSiteId(teamId)
    await this.client.post('/api/v1/sites', {
      domain
    })
    await this.createGoals(domain)
    await this.prismaService.team.update({
      where: { id: teamId },
      data: {
        plausibleToken: await this.createSharedLink(domain)
      }
    })
  }

  private async createSharedLink(domain: string): Promise<string | undefined> {
    const response = await this.client.put('/api/v1/sites/shared-links', {
      site_id: domain,
      name: 'api-journeys'
    })
    if (typeof response.data.url === 'string')
      return (
        new URL(response.data.url as string).searchParams.get('auth') ??
        undefined
      )
  }

  private async createGoals(domain: string): Promise<void> {
    const eventNames: Array<keyof JourneyPlausibleEvents> = [
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
    await Promise.all(
      eventNames.map(
        async (eventName) =>
          await this.client.put('/api/v1/sites/goals', {
            site_id: domain,
            goal_type: 'event',
            event_name: eventName
          })
      )
    )
  }

  private journeySiteId(journeyId: string): string {
    return `api-journeys-journey-${journeyId}`
  }

  private teamSiteId(teamId: string): string {
    return `api-journeys-team-${teamId}`
  }
}
