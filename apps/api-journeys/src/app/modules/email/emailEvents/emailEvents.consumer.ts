import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import { Prisma } from '.prisma/api-journeys-client'
import { EmailService } from '@core/nest/common/email/emailService'

import { VisitorInteraction } from '../../../emails/templates/VisitorInteraction'
import { fetchEmailDetails } from '../../../lib/fetchEmailDetails'
import { PrismaService } from '../../../lib/prisma.service'
import { processUserIds } from '../../../lib/processUserIds'

const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache(),
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? ''
  }
})

export type JourneyWithTeamAndUserJourney = Prisma.JourneyGetPayload<{
  include: {
    team: {
      include: {
        userTeams: {
          include: {
            journeyNotifications: true
          }
        }
      }
    }
    userJourneys: {
      include: {
        journeyNotification: true
      }
    }
  }
}>

export interface EventsNotificationJob {
  journeyId: string
  visitorId: string
}

export type ApiUsersJob = EventsNotificationJob

@Processor('api-journeys-events-email')
export class EmailEventsConsumer extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService
  ) {
    super()
  }

  async process(job: Job<ApiUsersJob>): Promise<void> {
    switch (job.name) {
      case 'visitor-event':
        await this.visitorEventEmails(job)
        break
    }
  }

  async visitorEventEmails(job: Job<EventsNotificationJob>): Promise<void> {
    const { journey, visitor } = await fetchEmailDetails(
      this.prismaService,
      job.data.journeyId,
      job.data.visitorId
    )

    if (journey == null) return
    if (visitor == null) return

    const recipientUserIds = processUserIds(journey)

    await Promise.all(
      recipientUserIds.map(async (userId) => {
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

        const analyticsUrl = `${
          process.env.JOURNEYS_ADMIN_URL ?? ''
        }/reports/visitors/${visitor.id}?journeyId=${journey.id}`
        const unsubscribeUrl = `${
          process.env.JOURNEYS_ADMIN_URL ?? ''
        }/journeys/${journey.id}?manageAccess=true`

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
          subject: `Visitor #${visitor.id.slice(
            -12
          )} has interacted with your journey`,
          text,
          html
        })
      })
    )
  }
}
