import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Job } from 'bullmq'
import { graphql } from 'gql.tada'

import { AiTranslateJourneyJob } from '../service'

export async function duplicateJourney(
  job: Job<AiTranslateJourneyJob>,
  apollo: ApolloClient<NormalizedCacheObject>
) {
  const JOURNEY_DUPLICATE = graphql(`
    mutation JourneyDuplicate($id: ID!, $teamId: ID!) {
      journeyDuplicate(id: $id, teamId: $teamId) {
        id
      }
    }
  `)

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
