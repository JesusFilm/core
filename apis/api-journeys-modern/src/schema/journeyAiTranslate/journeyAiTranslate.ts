import { google } from '@ai-sdk/google'
import { ApolloClient, createHttpLink } from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache'
import { generateObject, generateText, streamObject } from 'ai'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { getCardBlocksContent } from './getCardBlocksContent'
import { getLanguageName } from './translateJourney/getLanguageName'

// Define interface for translation data
interface TranslatedBlock {
  blockId: string
  blockType:
    | 'TypographyBlock'
    | 'ButtonBlock'
    | 'RadioOptionBlock'
    | 'TextResponseBlock'
    | 'RadioQuestionBlock'
  updates: Record<string, string>
}

// Define Zod schemas for translation
const TranslatedFieldSchema = z.object({
  blockId: z.string().describe('The ID of the block to update'),
  blockType: z
    .enum([
      'TypographyBlock',
      'ButtonBlock',
      'RadioOptionBlock',
      'TextResponseBlock',
      'RadioQuestionBlock'
    ])
    .describe('The type of block'),
  updates: z
    .record(z.string(), z.string())
    .describe('Field names and their translated values')
})

const TranslatedBlocksSchema = z.array(TranslatedFieldSchema)

builder.mutationFields((t) => ({
  journeyAiTranslateCreate: t
    .withAuth({ isAuthenticated: true })
    .fieldWithInput({
      input: {
        journeyId: t.input.id({ required: true }),
        name: t.input.string({ required: true }),
        textLanguageId: t.input.id({ required: true }),
        videoLanguageId: t.input.id({ required: false })
      },
      type: 'ID',
      nullable: false,
      resolve: async (_root, { input }, { user }) => {
        // TODO: check if user has write access \
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

        // 1. First get the journey details using Prisma
        const journey = await prisma.journey.findUnique({
          where: {
            id: input.journeyId
          },
          include: {
            blocks: true
          }
        })

        if (!journey) {
          throw new Error('Could not fetch journey for translation')
        }

        // 2. Get the language names
        const sourceLanguageName = await getLanguageName(
          apollo,
          journey.languageId
        )
        if (sourceLanguageName == null)
          throw new Error('Could not fetch source language name')
        const requestedLanguageName = await getLanguageName(
          apollo,
          input.textLanguageId
        )
        if (requestedLanguageName == null)
          throw new Error('Could not fetch requested language name')

        // 3. Get Cards Content
        const stepBlocks = journey.blocks
          .filter((block) => block.typename === 'StepBlock')
          .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
        const cardBlocks = stepBlocks
          .map((block) =>
            journey.blocks.find(
              ({ parentBlockId }) =>
                parentBlockId === block.id && block.typename === 'CardBlock'
            )
          )
          .filter((block) => block !== undefined)

        const cardBlocksContent = await getCardBlocksContent({
          blocks: journey.blocks,
          cardBlocks
        })

        // 4. Use Gemini to analyze the journey content and get intent
        const prompt = `
Analyze this journey content and provide the key intent, themes, and target audience. 
Also suggest ways to culturally adapt this content for the target language: ${requestedLanguageName}.
The source language is: ${sourceLanguageName}.
The target language name is: ${requestedLanguageName}.

Journey Title: ${journey.title}
 ${journey.description ? `Journey Description: ${journey.description}` : ''}

Journey Content:
${cardBlocksContent.join('\n')}
`

        try {
          const { text: journeyAnalysis } = await generateText({
            model: google('gemini-2.0-flash'),
            prompt,
            onStepFinish: ({ usage }) => {
              console.log('usage', usage)
            }
          })

          // translate the journey title and description
          try {
            // Translate title and description
            const titleDescPrompt = `
Translate the following journey title and description to ${requestedLanguageName}.
If a description is not provided, return a brief 1 sentence description of the journey.

Original title: "${journey.title}"
Original description: "${journey.description || ''}"

Translation context:
${journeyAnalysis}

Return in this format:
Title: [translated title]
Description: [translated description]
      `

            const { object: translatedTitleDesc, usage } = await generateObject(
              {
                model: google('gemini-2.0-flash'),
                prompt: titleDescPrompt,
                schema: z.object({
                  title: z.string(),
                  description: z.string()
                })
              }
            )

            console.log('usage', usage)
            if (translatedTitleDesc.title === null)
              throw new Error('Failed to translate journey title')
            if (translatedTitleDesc.description === null)
              throw new Error('Failed to translate journey description')

            // Update the journey using Prisma
            await prisma.journey.update({
              where: {
                id: input.journeyId
              },
              data: {
                title: translatedTitleDesc.title,
                description: translatedTitleDesc.description,
                languageId: input.textLanguageId
              }
            })

            console.log('Successfully translated journey title and description')
          } catch (error) {
            console.error('Error translating journey title/description', error)
            // Continue with the rest of the translation
          }

          // 5. Translate each card
          const cardBlocks = journey.blocks.filter(
            (block) => block.typename === 'CardBlock'
          )

          console.log(
            `Analyzing and translating ${cardBlocks.length} card blocks individually`
          )

          for (let i = 0; i < cardBlocks.length; i++) {
            const cardBlock = cardBlocks[i]
            const cardContent = cardBlocksContent[i]

            try {
              // Get all child blocks of this card
              const cardBlocksChildren = journey.blocks.filter(
                ({ parentBlockId }) => parentBlockId === cardBlock.id
              )

              // Skip if no children to translate
              if (cardBlocksChildren.length === 0) {
                console.log(
                  `Card ${cardBlock.id} has no child blocks to translate, skipping`
                )
                continue
              }

              // Get radio question blocks to find their radio option blocks
              const radioQuestionBlocks = cardBlocksChildren.filter(
                (block) => block.typename === 'RadioQuestionBlock'
              )

              // Find all radio option blocks that need translation
              const radioOptionBlocks = []
              for (const radioQuestionBlock of radioQuestionBlocks) {
                const options = journey.blocks.filter(
                  (block) =>
                    block.parentBlockId === radioQuestionBlock.id &&
                    block.typename === 'RadioOptionBlock'
                )
                radioOptionBlocks.push(...options)
              }

              // All blocks that need translation including radio options
              const allBlocksToTranslate = [
                ...cardBlocksChildren,
                ...radioOptionBlocks
              ]

              // Create a map of valid block IDs for quick lookup
              const validBlockIds = new Set(
                journey.blocks.map((block) => block.id)
              )

              // Create prompt for translation
              const cardAnalysisPrompt = `
            Translate the following blocks from ${sourceLanguageName} to ${requestedLanguageName}.
            
            Card content:
            ${cardContent}
            
            Translate the following blocks and return a list of translated content.
            
            Blocks to translate:
            ${allBlocksToTranslate
              .map((block) => {
                switch (block.typename) {
                  case 'TypographyBlock':
                    return `Block ID: ${block.id}
                            Type: TypographyBlock
                            Content to translate: "${block.content || ''}"`
                  case 'ButtonBlock':
                    return `Block ID: ${block.id}
                            Type: ButtonBlock
                            Label to translate: "${block.label || ''}"`
                  case 'RadioQuestionBlock':
                    return `Block ID: ${block.id}
                            Type: RadioQuestionBlock
                            Label to translate: "${block.label || ''}"`
                  case 'RadioOptionBlock':
                    return `Block ID: ${block.id}
                            Type: RadioOptionBlock
                            Label to translate: "${block.label || ''}"`
                  case 'TextResponseBlock':
                    return `Block ID: ${block.id}
                            Type: TextResponseBlock
                            Label to translate: "${block.label || ''}"
                            Placeholder to translate: "${block.placeholder || ''}"`
                  default:
                    return null
                }
              })
              .filter(Boolean)
              .join('\n\n')}
            
            IMPORTANT: For each block, use ONLY the EXACT Block IDs provided above. Do not use placeholder, sequential, or made-up IDs like "1", "2", etc.
            
            Return an array where each item is an object with:
            - blockId: The EXACT ID of the block as provided above
            - blockType: The type of the block
            - updates: An object with field names and their translated values
            
            For RadioOptionBlock, translate the "label" field.
            For TextResponseBlock, translate both "label" and "placeholder" fields if present.
            For all other blocks, translate the appropriate field (content for TypographyBlock, label for ButtonBlock, etc.)
            
            Ensure translations maintain the meaning and intent while being culturally appropriate for ${requestedLanguageName}.
            Keep translations concise and effective for their UI context (e.g., button labels should remain short).
          `

              try {
                console.log(
                  `Translating card ${cardBlock.id} with ${allBlocksToTranslate.length} blocks using streaming`
                )

                // Stream the translations
                const { fullStream } = streamObject({
                  model: google('gemini-2.0-flash'),
                  output: 'no-schema',
                  prompt: cardAnalysisPrompt,
                  onError: ({ error }) => {
                    console.error(
                      `Error in translation stream for card ${cardBlock.id}:`,
                      error
                    )
                  }
                })

                let blockCount = 0
                let invalidBlockCount = 0
                let partialTranslations = []

                // Process the stream as chunks arrive
                for await (const chunk of fullStream) {
                  // Process object chunks which contain translation data
                  if (chunk.type === 'object' && chunk.object) {
                    // Handle streaming array building
                    if (Array.isArray(chunk.object)) {
                      partialTranslations = chunk.object

                      // Process each block in the array
                      for (const item of partialTranslations) {
                        try {
                          // Check if we've already processed this block (in case of duplicate items in stream)
                          if (
                            item &&
                            typeof item === 'object' &&
                            'blockId' in item &&
                            typeof item.blockId === 'string' &&
                            'updates' in item &&
                            typeof item.updates === 'object'
                          ) {
                            // Check if block ID is valid before trying to update
                            const typedBlock =
                              item as unknown as TranslatedBlock

                            // Verify block ID exists in our journey
                            if (!validBlockIds.has(typedBlock.blockId)) {
                              console.error(
                                `Skipping invalid block ID ${typedBlock.blockId} - not found in journey`
                              )
                              invalidBlockCount++
                              continue
                            }

                            await prisma.block.update({
                              where: {
                                id: typedBlock.blockId
                              },
                              data: typedBlock.updates
                            })
                            blockCount++
                            console.log(
                              `Successfully updated block ${typedBlock.blockId} (${blockCount}/${allBlocksToTranslate.length})`
                            )
                          }
                        } catch (updateError) {
                          if (
                            item &&
                            typeof item === 'object' &&
                            'blockId' in item
                          ) {
                            const blockIdString =
                              typeof item.blockId === 'string'
                                ? item.blockId
                                : JSON.stringify(item.blockId)

                            console.error(
                              `Error updating block ${blockIdString}:`,
                              updateError
                            )
                          } else {
                            console.error(
                              `Error updating unknown block:`,
                              updateError
                            )
                          }
                        }
                      }
                    }
                  } else if (chunk.type === 'finish') {
                    console.log(
                      `Translation stream finished for card ${cardBlock.id}`
                    )
                  }
                }

                if (invalidBlockCount > 0) {
                  console.warn(
                    `Found ${invalidBlockCount} invalid block IDs that don't exist in journey`
                  )
                }

                console.log(
                  `Completed streaming translation of card ${cardBlock.id} with ${blockCount} blocks updated`
                )
              } catch (error) {
                console.error(`Error translating card ${cardBlock.id}:`, error)
                // Continue with other cards
              }
            } catch (error) {
              console.error(
                `Error analyzing and translating card ${cardBlock.id}:`,
                error
              )
              // Continue with other cards
            }
          }
        } catch (error: unknown) {
          console.error('Error analyzing journey with Gemini:', error)
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          throw new Error(`Failed to analyze journey: ${errorMessage}`)
        }
        return input.journeyId
      }
    })
}))
