import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import { prisma } from '@core/prisma/journeys/client'
import { graphql } from '@core/shared/gql'
import { sendEmail } from '@core/yoga/email'
import {
  ApiUsersJob,
  EventsNotificationJob
} from '@core/yoga/emailEvents/types'

import { VisitorInteraction } from '../../../emails/templates/VisitorInteraction'

import { fetchEmailDetails } from './fetchEmailDetails'
import { processUserIds } from './processUserIds'

const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-journeys-modern',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

export async function service(job: Job<ApiUsersJob>): Promise<void> {
  switch (job.name) {
    case 'visitor-event':
      await visitorEventEmails(job)
      break
  }
}

async function visitorEventEmails(
  job: Job<EventsNotificationJob>
): Promise<void> {
  const { journey, visitor } = await fetchEmailDetails(
    prisma,
    job.data.journeyId,
    job.data.visitorId
  )

  if (journey == null) return
  if (visitor == null) return

  const recipientUserIds = processUserIds(journey)

  await Promise.all(
    recipientUserIds.map(async (userId) => {
      const { data } = await apollo.query({
        query: graphql(`
          query User($userId: ID!) {
            user(id: $userId) {
              id
              firstName
              email
              imageUrl
            }
          }
        `),
        variables: { userId }
      })

      if (data.user == null) return

      const analyticsUrl = `${
        process.env.JOURNEYS_ADMIN_URL ?? ''
      }/reports/visitors/${visitor.id}?journeyId=${journey.id}`
      const unsubscribeUrl = `${
        process.env.JOURNEYS_ADMIN_URL ?? ''
      }/journeys/${journey.id}?manageAccess=true`

      const text = await render(
        VisitorInteraction({
          title: journey.title,
          recipient: data.user,
          analyticsUrl,
          unsubscribeUrl,
          visitor
        }),
        { plainText: true }
      )

      const html = await render(
        VisitorInteraction({
          title: journey.title,
          recipient: data.user,
          analyticsUrl,
          unsubscribeUrl,
          visitor
        })
      )

      await sendEmail({
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
