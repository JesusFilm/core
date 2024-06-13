import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import {
  Event,
  Journey,
  JourneyNotification,
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

interface ExtendedUserJourneys extends UserJourney {
  journeyNotification: JourneyNotification | null
}

interface ExtendedUserTeam extends UserTeam {
  journeyNotifications: JourneyNotification[]
}

export interface ExtendedJourneys extends Journey {
  userJourneys: ExtendedUserJourneys[]
  team: Team & {
    userTeams: ExtendedUserTeam[]
  }
}

interface EmailDetailsResult {
  journey: ExtendedJourneys | null
  visitor:
    | (Pick<Visitor, 'createdAt' | 'duration'> & { events: Event[] })
    | null
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
      .forEach((userJourney) => {
        const journeyNotification = userJourney.journeyNotification
        const userId = journeyNotification?.userId as string
        if (journeyNotification?.visitorInteractionEmail === true)
          recipientUserIds.add(userId)
      })

    if (journey.team != null) {
      journey.team.userTeams.forEach((userTeam) => {
        const journeyNotification = userTeam.journeyNotifications.find(
          (notification) => notification.userId === userTeam.userId
        )
        const userId = journeyNotification?.userId as string
        if (journeyNotification?.visitorInteractionEmail === true)
          recipientUserIds.add(userId)
      })
    }

    return Array.from(recipientUserIds)
  }

  async fetchEmailDetails(
    journeyId: string,
    visitorId: string
  ): Promise<EmailDetailsResult> {
    const [journey, visitor] = await Promise.all([
      this.prismaService.journey.findUnique({
        where: { id: journeyId },
        include: {
          userJourneys: {
            include: {
              journeyNotification: true
            }
          },
          team: {
            include: {
              userTeams: {
                include: {
                  journeyNotifications: true
                }
              }
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
      })
    ])

    return { journey, visitor }
  }

  async sendUserNotification(
    userId: string,
    journey: Journey,
    visitor: Pick<Visitor, 'createdAt' | 'duration'> & { events: Event[] }
  ): Promise<void> {
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
    const { journey, visitor } = await this.fetchEmailDetails(
      job.data.journeyId,
      job.data.visitorId
    )

    if (journey == null) return
    if (visitor == null) return

    const recipientUserIds = this.proccesUserIds(journey)

    await Promise.all(
      recipientUserIds.map(async (userId) => {
        await this.sendUserNotification(userId, journey, visitor)
      })
    )
  }
}
