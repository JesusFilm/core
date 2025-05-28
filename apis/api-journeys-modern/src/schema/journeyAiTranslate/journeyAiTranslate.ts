import { google } from '@ai-sdk/google'
import { generateObject, streamObject } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { Action, ability, subject } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import {
  castBlock,
  createTranslationInfo,
  getTranslatableFields,
  updateBlockWithTranslation
} from '../../lib/translation/blockTranslation'
import { builder } from '../builder'

import { getCardBlocksContent } from './getCardBlocksContent'

// Define the translation progress interface
interface JourneyAiTranslateProgress {
  progress: number
  message: string
  journey: any | null
}

// Define the translation progress type
const JourneyAiTranslateProgressRef =
  builder.objectRef<JourneyAiTranslateProgress>('JourneyAiTranslateProgress')

builder.objectType(JourneyAiTranslateProgressRef, {
  fields: (t) => ({
    progress: t.float({
      description: 'Translation progress as a percentage (0-100)',
      resolve: (parent) => parent.progress
    }),
    message: t.string({
      description: 'Current translation step message',
      resolve: (parent) => parent.message
    }),
    journey: t.prismaField({
      type: 'Journey',
      nullable: true,
      description: 'The journey being translated (only present when complete)',
      resolve: (query, parent) => {
        // Return the journey if it exists, otherwise null
        return parent.journey ? { ...query, ...parent.journey } : null
      }
    })
  })
})

// Define Zod schemas for AI responses
const JourneyAnalysisSchema = z.object({
  analysis: z
    .string()
    .describe('Analysis of the journey content and cultural considerations'),
  title: z.string().describe('Translated journey title'),
  description: z.string().describe('Translated journey description')
})

const BlockTranslationSchema = z.array(
  z.object({
    blockId: z.string().describe('The ID of the block to update'),
    updates: z
      .record(z.string())
      .describe('Key-value pairs of fields to update')
  })
)

builder.subscriptionField('journeyAiTranslateCreate', (t) =>
  // TODO: Re-enable auth after testing - t.withAuth({ isAuthenticated: true })
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyAiTranslateProgressRef,
    nullable: false,
    args: {
      input: t.arg({
        type: builder.inputType('JourneyAiTranslateInput', {
          fields: (t) => ({
            journeyId: t.id({ required: true }),
            name: t.string({ required: true }),
            journeyLanguageName: t.string({ required: true }),
            textLanguageId: t.id({ required: true }),
            textLanguageName: t.string({ required: true })
          })
        }),
        required: true
      })
    },
    subscribe: async function* (_root, { input }, context) {
      // Create async iterable for real AI translation
      try {
        // Initial progress
        yield {
          progress: 0,
          message: 'Starting translation...',
          journey: null
        }

        // Validate journey exists and user has permission
        const journey = await prisma.journey.findUnique({
          where: { id: input.journeyId },
          include: {
            blocks: true,
            userJourneys: true,
            team: {
              include: {
                userTeams: true
              }
            }
          }
        })

        if (journey == null) {
          throw new GraphQLError('journey not found')
        }

        // Check permissions
        const hasPermission = ability(
          Action.Update,
          subject('Journey', journey),
          context.user
        )

        if (!hasPermission) {
          throw new GraphQLError(
            'user does not have permission to update journey'
          )
        }

        yield {
          progress: 10,
          message: 'Validating journey permissions...',
          journey: null
        }

        // Get card blocks and their content
        const cardBlocks = journey.blocks.filter(
          (block) => block.typename === 'CardBlock'
        )

        yield {
          progress: 20,
          message: 'Analyzing journey content...',
          journey: null
        }

        // Get content for AI analysis
        const cardBlocksContent = await getCardBlocksContent({
          blocks: journey.blocks,
          cardBlocks
        })

        const journeyContent = `
Journey Title: ${journey.title}
Journey Description: ${journey.description ?? 'No description'}

${cardBlocksContent.join('\n\n')}
              `.trim()

        yield {
          progress: 30,
          message: 'Translating journey title and description...',
          journey: null
        }

        // Step 1: Translate journey title and description
        const analysisPrompt = `
You are a professional translator specializing in religious and spiritual content. 
Translate the following journey from ${input.journeyLanguageName} to ${input.textLanguageName}.

Please provide:
1. A brief analysis of the content and any cultural considerations
2. A translated title that maintains the original meaning and impact
3. A translated description (if one exists)

Ensure the translation is culturally appropriate and maintains the spiritual context.

Journey to translate:
${hardenPrompt(journeyContent)}
              `.trim()

        const analysisResult = await generateObject({
          model: google('gemini-1.5-flash'),
          messages: [
            { role: 'system', content: preSystemPrompt },
            { role: 'user', content: analysisPrompt }
          ],
          schema: JourneyAnalysisSchema
        })

        if (!analysisResult.object.title) {
          throw new GraphQLError('Failed to translate journey title')
        }

        yield {
          progress: 50,
          message: 'Updating journey with translated title...',
          journey: null
        }

        // Update journey with translated title and description
        const updateData: any = {
          title: analysisResult.object.title,
          languageId: input.textLanguageId
        }

        if (journey.description && analysisResult.object.description) {
          updateData.description = analysisResult.object.description
        }

        const updatedJourney = await prisma.journey.update({
          where: { id: input.journeyId },
          data: updateData
        })

        yield {
          progress: 60,
          message: `Translating card content (${cardBlocks.length} cards)...`,
          journey: updatedJourney
        }

        // Step 2: Translate blocks for each card
        let cardIndex = 0
        for (const cardContent of cardBlocksContent) {
          cardIndex++
          const progressPercent = 60 + (cardIndex / cardBlocks.length) * 30

          yield {
            progress: progressPercent,
            message: `Translating card ${cardIndex} of ${cardBlocks.length}...`,
            journey: null
          }

          try {
            // Get translatable blocks for this card
            const cardBlock = cardBlocks[cardIndex - 1]
            const cardChildren = journey.blocks.filter(
              (block) => block.parentBlockId === cardBlock.id
            )

            const translatableBlocks = cardChildren.filter((block) => {
              const typedBlock = castBlock(block)
              const fields = Object.keys(getTranslatableFields(typedBlock))
              return fields.length > 0
            })

            if (translatableBlocks.length === 0) {
              continue
            }

            // Create translation info for each block
            const blockInfos = translatableBlocks.map((block) =>
              createTranslationInfo(castBlock(block))
            )

            const blockTranslationPrompt = `
Translate the following blocks from ${input.journeyLanguageName} to ${input.textLanguageName}.

Context: ${hardenPrompt(analysisResult.object.analysis)}

Card content:
${hardenPrompt(cardContent)}

Blocks to translate:
${hardenPrompt(blockInfos.join('\n'))}

For each block, provide the blockId and the translated field values.
Only include fields that need translation (content, label, placeholder).
Maintain the spiritual and religious context appropriately.
                  `.trim()

            // Stream the block translations
            const blockTranslationResult = await streamObject({
              model: google('gemini-1.5-flash'),
              messages: [
                { role: 'system', content: preSystemPrompt },
                { role: 'user', content: blockTranslationPrompt }
              ],
              schema: BlockTranslationSchema
            })

            // Process the streamed translations
            for await (const chunk of blockTranslationResult.fullStream) {
              if (chunk.type === 'object' && chunk.object) {
                // Apply translations to blocks
                for (const translation of chunk.object) {
                  await updateBlockWithTranslation(
                    prisma,
                    input.journeyId,
                    translation as any
                  )
                }
              }
            }
          } catch (error) {
            console.error(`Error translating card ${cardIndex}:`, error)
            // Continue with other cards even if one fails
          }
        }

        yield {
          progress: 95,
          message: 'Finalizing translation...',
          journey: null
        }

        // Get the final updated journey with all translated blocks
        const finalJourney = await prisma.journey.findUnique({
          where: { id: input.journeyId },
          include: {
            blocks: true
          }
        })

        return {
          progress: 100,
          message: 'Translation completed!',
          journey: finalJourney
        }
      } catch (error) {
        console.error('Translation error:', error)
        return {
          progress: 100,
          message: 'Translation failed: ' + (error as Error).message,
          journey: null
        }
      }
    },
    resolve: (progressUpdate) => {
      console.log('progressUpdate', progressUpdate)
      return progressUpdate
    }
  })
)
