import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client'
import { Job } from 'bullmq'
import { Logger } from 'pino'

export interface AiTranslateJourneyJob {
  userId: string
  type: 'journeyAiTranslate'
  inputJourneyId: string
  outputJourneyId: string
  name: string
  textLanguageId: string
  videoLanguageId: string
}

export const service = async (
  job: Job<AiTranslateJourneyJob>,
  customLogger?: Logger
): Promise<void> => {
  await duplicateJourney(job)
  await translateJourney(job)
}

export async function duplicateJourney(
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

  // Define the journeyDuplicate mutation
  const JOURNEY_DUPLICATE = gql`
    mutation JourneyDuplicate($id: ID!, $teamId: ID!) {
      journeyDuplicate(id: $id, teamId: $teamId) {
        id
      }
    }
  `

  // Call the journeyDuplicate mutation
  const { data } = await apollo.mutate({
    mutation: JOURNEY_DUPLICATE,
    variables: {
      id: job.data.inputJourneyId,
      teamId: job.data.userId // Using userId as teamId (adjust if needed)
    }
  })

  if (data?.journeyDuplicate?.id) {
    // Store the duplicated journey ID for the next step
    await job.updateData({
      ...job.data,
      outputJourneyId: data.journeyDuplicate.id
    })
  } else {
    throw new Error('Failed to duplicate journey')
  }
  await job.updateProgress(25)
}

export async function translateJourney(
  job: Job<AiTranslateJourneyJob>
): Promise<void> {
  await job.updateProgress(100)
  // TODO: Implement
}
