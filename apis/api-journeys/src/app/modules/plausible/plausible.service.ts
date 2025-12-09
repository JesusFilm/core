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

interface PlausibleCreateTemplateSiteJob {
  __typename: 'plausibleCreateTemplateSite'
  templateId: string
}

export type PlausibleJob =
  | PlausibleCreateTeamSiteJob
  | PlausibleCreateJourneySiteJob
  | PlausibleCreateSitesJob
  | PlausibleCreateTemplateSiteJob

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
  'rsvpCapture',
  'specialVideoStartCapture',
  'specialVideoCompleteCapture',
  'custom1Capture',
  'custom2Capture',
  'custom3Capture'
]

@Injectable()
export class PlausibleService {
  constructor(
    @InjectQueue('api-journeys-plausible')
    private readonly plausibleQueue: Queue<PlausibleJob>
  ) {}
}
