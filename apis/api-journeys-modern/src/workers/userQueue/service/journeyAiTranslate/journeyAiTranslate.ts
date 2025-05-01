import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client'
import { Job } from 'bullmq'

import { AiTranslateJourneyJob } from '../service'

// Add a type interface for journey blocks
interface JourneyBlock {
  id: string
  journeyId: string
  typename: string
  parentBlockId?: string
  content?: string
  [key: string]: any
}

export async function journeyAiTranslate(
  job: Job<AiTranslateJourneyJob>
): Promise<void> {
  // First duplicate the journey
  const duplicatedJob = await duplicateJourney(job)

  // Then translate the duplicated journey
  if (duplicatedJob.data.outputJourneyId) {
    await translateJourney(duplicatedJob)
  } else {
    throw new Error(
      'Journey duplication failed, cannot proceed with translation'
    )
  }
}

export async function duplicateJourney(
  job: Job<AiTranslateJourneyJob>
): Promise<Job<AiTranslateJourneyJob>> {
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

  // Return the updated job for the next step
  return job
}

export async function translateJourney(
  job: Job<AiTranslateJourneyJob>
): Promise<void> {
  await job.updateProgress(50)

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

  // 1. First get the journey details
  const GET_JOURNEY = gql`
    query GetJourney($id: ID!) {
      journey(id: $id) {
        id
        title
        description
        language {
          id
          name
        }
        blocks {
          id
          journeyId
          typename
          ... on StepBlock {
            id
            nextBlockId
            locked
            parentOrder
          }
          ... on CardBlock {
            id
            parentBlockId
            parentOrder
            coverBlockId
            backgroundColor
            themeMode
            themeName
          }
          ... on TypographyBlock {
            id
            parentBlockId
            parentOrder
            content
            variant
            align
            color
          }
          ... on VideoBlock {
            id
            parentBlockId
            parentOrder
            videoId
            videoVariantLanguageId
            source
            title
            description
            image
            duration
            autoplay
            startAt
            endAt
            posterBlockId
            fullsize
            videoPosition
            muted
            showControls
            action {
              parentBlockId
              gtmEventName
              navigateToBlockId
            }
          }
          ... on ButtonBlock {
            id
            parentBlockId
            parentOrder
            label
            buttonVariant
            buttonColor
            size
            startIconId
            endIconId
            action {
              parentBlockId
              gtmEventName
              navigateToBlockId
            }
          }
        }
      }
    }
  `

  // Fetch the journey that needs to be translated
  const { data: journeyData } = await apollo.query({
    query: GET_JOURNEY,
    variables: {
      id: job.data.outputJourneyId
    }
  })

  if (!journeyData?.journey) {
    throw new Error('Could not fetch journey for translation')
  }

  // 2. Update journey title and description with translated versions
  const updatedTitle = `${journeyData.journey.title} (${job.data.textLanguageId})`
  const updatedDescription = journeyData.journey.description
    ? `${journeyData.journey.description} - Translated to ${job.data.textLanguageId}`
    : `Translated to ${job.data.textLanguageId}`

  // 3. Prepare journey update mutation
  const UPDATE_JOURNEY = gql`
    mutation UpdateJourney(
      $id: ID!
      $teamId: ID!
      $title: String
      $description: String
      $languageId: ID
    ) {
      journeyUpdate(
        id: $id
        teamId: $teamId
        input: {
          title: $title
          description: $description
          languageId: $languageId
        }
      ) {
        id
      }
    }
  `

  // 4. Update the journey with translated information
  await apollo.mutate({
    mutation: UPDATE_JOURNEY,
    variables: {
      id: job.data.outputJourneyId,
      teamId: job.data.userId,
      title: updatedTitle,
      description: updatedDescription,
      languageId: job.data.textLanguageId
    }
  })

  // 5. Translate all text blocks (typography blocks)
  const typographyBlocks = journeyData.journey.blocks.filter(
    (block: JourneyBlock) => block.typename === 'TypographyBlock'
  )

  // 6. Update progress as we process blocks
  const totalBlocks = typographyBlocks.length
  let processedBlocks = 0

  // Update typography blocks mutation
  const UPDATE_TYPOGRAPHY_BLOCK = gql`
    mutation UpdateTypographyBlock(
      $id: ID!
      $journeyId: ID!
      $teamId: ID!
      $content: String
    ) {
      typographyBlockUpdate(
        id: $id
        journeyId: $journeyId
        teamId: $teamId
        input: { content: $content }
      ) {
        id
      }
    }
  `

  // 7. Process each typography block
  for (const block of typographyBlocks) {
    if (block.content) {
      // Simulate translation - in a real implementation, you would call an actual
      // translation service here to translate the content
      const translatedContent = `[${job.data.textLanguageId}] ${block.content}`

      // Update the block with translated content
      await apollo.mutate({
        mutation: UPDATE_TYPOGRAPHY_BLOCK,
        variables: {
          id: block.id,
          journeyId: job.data.outputJourneyId,
          teamId: job.data.userId,
          content: translatedContent
        }
      })

      // Update progress
      processedBlocks++
      const progress = 50 + Math.floor((processedBlocks / totalBlocks) * 50)
      await job.updateProgress(progress > 99 ? 99 : progress)
    }
  }

  // 8. Update video blocks to use the new language if specified
  if (job.data.videoLanguageId) {
    const videoBlocks = journeyData.journey.blocks.filter(
      (block: JourneyBlock) => block.typename === 'VideoBlock'
    )

    const UPDATE_VIDEO_BLOCK = gql`
      mutation UpdateVideoBlock(
        $id: ID!
        $journeyId: ID!
        $teamId: ID!
        $videoVariantLanguageId: ID
      ) {
        videoBlockUpdate(
          id: $id
          journeyId: $journeyId
          teamId: $teamId
          input: { videoVariantLanguageId: $videoVariantLanguageId }
        ) {
          id
        }
      }
    `

    for (const block of videoBlocks) {
      await apollo.mutate({
        mutation: UPDATE_VIDEO_BLOCK,
        variables: {
          id: block.id,
          journeyId: job.data.outputJourneyId,
          teamId: job.data.userId,
          videoVariantLanguageId: job.data.videoLanguageId
        }
      })
    }
  }

  // Mark job as complete
  await job.updateProgress(100)
}
