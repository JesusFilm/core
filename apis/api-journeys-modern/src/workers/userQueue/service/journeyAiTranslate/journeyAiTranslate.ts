import { google } from '@ai-sdk/google'
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
    targetLanguageName?: string
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
  await job.updateProgress(35)

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

  // 2. Get the language name for textLanguageId in language 529
  const GET_LANGUAGE = graphql(`
    query GetLanguage($id: ID!, $languageId: ID!) {
      language(id: $id) {
        id
        name(languageId: $languageId) {
          value
        }
      }
    }
  `)

  await job.updateProgress(45)

  // Get the requested language information in language ID 529
  let requestedLanguageName = ''

  try {
    const { data: languageData } = await apollo.query({
      query: GET_LANGUAGE,
      variables: {
        id: job.data.textLanguageId,
        languageId: '529'
      }
    })

    // Check the requested language data
    if (languageData?.language?.name?.[0]?.value) {
      requestedLanguageName = languageData.language.name[0].value
      console.log(`Requested language name in 529: ${requestedLanguageName}`)

      // Store the language name for use in translation
      await job.updateData({
        ...job.data,
        targetLanguageName: requestedLanguageName
      })
    }
  } catch (error) {
    console.error('Error fetching language data:', error)
    // Continue with the process
  }

  // 3. Use Gemini to analyze the journey content and get intent
  await job.updateProgress(50)

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
    .map((block) => block.image)

  // 4. Generate brief descriptions of images using gemini-2.0-flash-lite
  let imageDescriptions = ''

  if (journeyImages.length > 0) {
    try {
      console.log(
        `Generating descriptions for ${journeyImages.length} images...`
      )

      // Process each image to get a brief description
      for (let i = 0; i < journeyImages.length; i++) {
        const image = journeyImages[i]

        if (!image) {
          continue // Skip if no valid URL
        }

        try {
          // Use Gemini to analyze the image via URL directly
          const { text: imageDescription } = await generateText({
            model: google('gemini-2.0-flash-lite'),
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this image and provide a brief description focusing on key elements relevant to a journey or story (1-2 sentences)`
                  },

                  {
                    type: 'image',
                    image: image
                  }
                ]
              }
            ]
          })

          // Add the description to our collection
          if (imageDescription) {
            imageDescriptions += `\nImage ${i + 1} Description: ${imageDescription.trim()}\n`
          }

          // Update progress incrementally (5% per image, keeping within bounds)
          const progressIncrement = Math.min(5, 30 / journeyImages.length)
          await job.updateProgress(
            Math.min(80, 50 + (i + 1) * progressIncrement)
          )
        } catch (imgError) {
          console.error(`Error analyzing image ${i + 1}:`, imgError)
          // Continue with other images
        }
      }

      console.log('Image descriptions generated successfully')
    } catch (error) {
      console.error('Error in image analysis step:', error)
      // Continue to main analysis even if image analysis fails
    }
  }

  try {
    // Initialize Gemini model
    // Note: API key must be set via GOOGLE_GENERATIVE_AI_API_KEY environment variable
    const geminiModel = google('gemini-2.0-flash')

    // Get the target language name to use in the prompt
    const analysisTargetLanguage =
      requestedLanguageName || job.data.textLanguageId

    // 5. Generate analysis with Gemini
    const prompt = `Analyze this journey content and provide the key intent, themes, and target audience. 
      Also suggest ways to culturally adapt this content for the target language: ${analysisTargetLanguage}.
      The source language name is: ${journeyData.journey.language?.name?.[0]?.value || 'unknown'}.
      The target language name is: ${job.data.targetLanguageName || 'unknown'}.
      
      ${journeyContent}
      
      Journey Images:${imageDescriptions ? imageDescriptions : ' No images available'}`

    const { text: journeyAnalysis } = await generateText({
      model: geminiModel,
      prompt
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
