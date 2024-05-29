import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import { EmailService } from '@core/nest/common/email/emailService'

import { VisitorInteraction } from '../../../emails/templates/VisitorInteraction'

const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache(),
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? ''
  }
})

export interface EventsNotificationJob {
  journeyId: string
  visitorId: string
  userId: string
}

export type ApiUsersJob = EventsNotificationJob

@Processor('api-journeys-events-email')
export class EmailConsumer extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super()
  }

  async process(job: Job<ApiUsersJob>): Promise<void> {
    switch (job.name) {
      case 'visitor-event':
        await this.sendEventsNotification(job)
        break
    }
  }

  async sendEventsNotification(job: Job<EventsNotificationJob>): Promise<void> {
    const { data } = await apollo.query({
      query: gql`
        query User($userId: ID!) {
          user(id: $userId) {
            id
            email
            firstName
            imageUrl
          }
        }
      `,
      variables: { userId: job.data.userId }
    })

    console.log('I got called')

    const text = render(
      VisitorInteraction({
        journeyId: job.data.journeyId,
        visitorId: job.data.visitorId
      }),
      {
        plainText: true
      }
    )

    const html = render(
      VisitorInteraction({
        journeyId: job.data.journeyId,
        visitorId: job.data.visitorId
      }),
      {
        pretty: true
      }
    )

    await this.emailService.sendEmail({
      to: data.user.email,
      subject: `You have a new event notification`,
      text,
      html
    })
  }
}
