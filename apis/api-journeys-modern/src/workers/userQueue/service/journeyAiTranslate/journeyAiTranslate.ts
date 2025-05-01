// @ts-expect-error -- Add these to your package.json dependencies
import { google } from '@ai-sdk/google'
// @ts-expect-error -- Add these to your package.json dependencies
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { generateText } from 'ai'
import { Job } from 'bullmq'
import { graphql } from 'gql.tada'

import { AiTranslateJourneyJob } from '../service'

// Update the interface to match the schema
interface JourneyBlock {
  id: string
  journeyId: string
  __typename: string
  parentBlockId?: string | null
  content?: string
  image?: string
  [key: string]: any
}

// Extend the AiTranslateJourneyJob type to include journeyAnalysis
declare module '../service' {
  interface AiTranslateJourneyJob {
    journeyAnalysis?: string
  }
}

const JOURNEY_DUPLICATE = graphql(`
  mutation JourneyDuplicate($id: ID!, $teamId: ID!) {
    journeyDuplicate(id: $id, teamId: $teamId) {
      id
    }
  }
`)

export async function journeyAiTranslate(
  job: Job<AiTranslateJourneyJob>
): Promise<void> {
  // First duplicate the journey
  await duplicateJourney(job)

  // Then translate the duplicated journey
  if (job.data.outputJourneyId) {
    await translateJourney(job)
  } else {
    throw new Error(
      'Journey duplication failed, cannot proceed with translation'
    )
  }
}

export async function duplicateJourney(job: Job<AiTranslateJourneyJob>) {
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
  const GET_JOURNEY = graphql(`
    query GetJourney($id: ID!) {
      journey(id: $id) {
        id
        title
        description
        language {
          id
          name {
            value
          }
        }
        blocks {
          id
          journeyId
          __typename
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
            typographyVariant: variant
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
            muted
          }
          ... on ButtonBlock {
            id
            parentBlockId
            parentOrder
            label
            buttonVariant: variant
            size
            startIconId
            endIconId
          }
        }
      }
    }
  `)

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

  // 2. Use Gemini to analyze the journey content and get intent
  // Cast blocks to our JourneyBlock type to fix linter errors
  const blocks = (journeyData.journey.blocks as unknown as JourneyBlock[]) || []

  // Extract text content from typography blocks
  const typographyBlocks = blocks.filter(
    (block) => block.__typename === 'TypographyBlock'
  )

  // Extract images from video blocks
  const videoBlocks = blocks.filter(
    (block) => block.__typename === 'VideoBlock'
  )

  // Create content for Gemini analysis
  let journeyContent = `Journey Title: ${journeyData.journey.title}\n`
  journeyContent += `Journey Description: ${journeyData.journey.description || 'No description'}\n\n`
  journeyContent += 'Journey Content:\n'

  // Add typography content
  typographyBlocks.forEach((block) => {
    if (block.content) {
      journeyContent += `${block.content}\n`
    }
  })

  // Prepare images for multi-modal analysis
  const journeyImages = videoBlocks
    .filter((block) => block.image)
    .map((block) => ({
      type: 'image_url' as const,
      image_url: { url: block.image }
    }))

  try {
    // Initialize Gemini model
    // Note: API key must be set via GOOGLE_GENERATIVE_AI_API_KEY environment variable
    const geminiModel = google('gemini-2.0-flash')

    // Prepare the request content
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this journey content and provide the key intent, themes, and target audience. 
            Also suggest ways to culturally adapt this content for the target language: ${job.data.textLanguageId}.
            
            ${journeyContent}`
          },
          ...journeyImages
        ]
      }
    ]

    // Generate analysis using Gemini
    const { text: journeyAnalysis } = await generateText({
      model: geminiModel,
      messages
    })

    // Store the analysis in the job data for use in translation
    await job.updateData({
      ...job.data,
      journeyAnalysis
    })

    // Update progress
    await job.updateProgress(100)
  } catch (error: unknown) {
    console.error('Error analyzing journey with Gemini:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to analyze journey: ${errorMessage}`)
  }
}
