
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { Job } from 'bullmq'

import { AiTranslateJourneyJob } from '../service'

import { duplicateJourney } from './duplicateJourney'
import { translateJourney } from './translateJourney'

export async function journeyAiTranslate(
  job: Job<AiTranslateJourneyJob>
): Promise<void> {
  // Create Apollo client
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

  // First duplicate the journey
  await duplicateJourney(job, apollo)

  // Then translate the duplicated journey
  if (job.data.outputJourneyId) {
    await translateJourney(job, apollo)
  } else {
    throw new Error(
      'Journey duplication failed, cannot proceed with translation'
    )
  }
}
