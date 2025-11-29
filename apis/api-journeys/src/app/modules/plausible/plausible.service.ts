import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

import { JourneyPlausibleEvents } from '@core/journeys/ui/plausibleHelpers'

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
  'videoTrigger'
]

@Injectable()
export class PlausibleService implements OnModuleInit {
  constructor(
    @InjectQueue('api-journeys-plausible')
    private readonly plausibleQueue: Queue<PlausibleJob>
  ) {}

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
}
