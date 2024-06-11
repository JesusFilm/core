import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import {
  Event,
  EventEmailNotifications,
  Journey,
  Team,
  UserJourney,
  UserTeam,
  Visitor
} from '.prisma/api-journeys-client'
import { EmailService } from '@core/nest/common/email/emailService'

import { UserJourneyRole } from '../../../__generated__/graphql'
import { VisitorInteraction } from '../../../emails/templates/VisitorInteraction'
import { PrismaService } from '../../../lib/prisma.service'

const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache(),
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? ''
  }
})

export interface ExtendedJourneys extends Journey {
  userJourneys: UserJourney[]
  team: Team & { userTeams: UserTeam[] }
}

interface EmailDetailsResult {
  journey: ExtendedJourneys | null
  visitor:
    | (Pick<Visitor, 'createdAt' | 'duration'> & { events: Event[] })
    | null
  eventEmailNotifications: EventEmailNotifications[]
}

export interface EventsNotificationJob {
  journeyId: string
  visitorId: string
}

export type ApiUsersJob = EventsNotificationJob

@Processor('api-journeys-events-email')
export class EmailConsumer extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService
  ) {
    super()
  }

  async process(job: Job<ApiUsersJob>): Promise<void> {
    switch (job.name) {
      case 'visitor-event':
        await this.sendEventsNotification(job)
        break
    }
  }

  proccesUserIds(journey: ExtendedJourneys): string[] {
    const recipientUserIds = new Set<string>()

    journey.userJourneys
      .filter(
        (userJourney) =>
          userJourney.role === UserJourneyRole.owner ||
          userJourney.role === UserJourneyRole.editor
      )
      .forEach((userJourney) => recipientUserIds.add(userJourney.userId))

    if (journey.team != null) {
      journey.team.userTeams.forEach((userTeam) =>
        recipientUserIds.add(userTeam.userId)
      )
    }

    return Array.from(recipientUserIds)
  }

  async fetchEmailDetails(
    journeyId: string,
    visitorId: string
  ): Promise<EmailDetailsResult> {
    const [journey, visitor, eventEmailNotifications] = await Promise.all([
      this.prismaService.journey.findUnique({
        where: { id: journeyId },
        include: {
          userJourneys: true,
          team: {
            include: {
              userTeams: true
            }
          }
        }
      }),
      this.prismaService.visitor.findUnique({
        where: { id: visitorId },
        select: {
          createdAt: true,
          duration: true,
          events: true
        }
      }),
      this.prismaService.eventEmailNotifications.findMany({
        where: {
          journeyId
        }
      })
    ])

    return { journey, visitor, eventEmailNotifications }
  }

  async sendUserNotification(
    userId: string,
    journey: Journey,
    visitor: Pick<Visitor, 'createdAt' | 'duration'> & { events: Event[] },
    eventEmailNotifications: EventEmailNotifications[]
  ): Promise<void> {
    const receiveNotification = eventEmailNotifications.find(
      (notification) => notification.userId === userId
    )?.value

    if (receiveNotification == null || !receiveNotification) return

    const { data } = await apollo.query({
      query: gql`
        query User($userId: ID!) {
          user(id: $userId) {
            id
            firstName
            email
            imageUrl
          }
        }
      `,
      variables: { userId }
    })

    const baseUrl = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys`
    const analyticsUrl = `${baseUrl}/${journey.id}/reports/visitors`
    const unsubscribeUrl = `${baseUrl}/${journey.id}?manageAccess=true`

    const text = render(
      VisitorInteraction({
        title: journey.title,
        recipient: data.user,
        analyticsUrl,
        unsubscribeUrl,
        visitor
      }),
      { plainText: true }
    )

    const html = render(
      VisitorInteraction({
        title: journey.title,
        recipient: data.user,
        analyticsUrl,
        unsubscribeUrl,
        visitor
      }),
      { pretty: true }
    )

    await this.emailService.sendEmail({
      to: data.user.email,
      subject: `A visitor has interacted with your journey`,
      text,
      html
    })
  }

  async sendEventsNotification(job: Job<EventsNotificationJob>): Promise<void> {
    const { journey, visitor, eventEmailNotifications } =
      await this.fetchEmailDetails(job.data.journeyId, job.data.visitorId)

    if (journey == null) return
    if (visitor == null) return
    if (eventEmailNotifications.length === 0) return

    const recipientUserIds = this.proccesUserIds(journey)

    await Promise.all(
      recipientUserIds.map(async (userId) => {
        await this.sendUserNotification(
          userId,
          journey,
          visitor,
          eventEmailNotifications
        )
      })
    )
  }
}
