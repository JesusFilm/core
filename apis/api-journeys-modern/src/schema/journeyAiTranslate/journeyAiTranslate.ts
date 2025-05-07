import { google } from '@ai-sdk/google'
import { ApolloClient, createHttpLink } from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { getCardBlocksContent } from './getCardBlocksContent'
import { getLanguageName } from './translateJourney/getLanguageName'
import { translateCardBlock } from './translateJourney/translateCard/translateCard'

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
              // Analyze this card in relation to the journey intent
              const cardAnalysisPrompt = `
            I'm going to give you a journey analysis and the content of a specific card in that journey.
            Your task is to analyze how this specific card contributes to the overall journey intent and translate each block of the card that contains a Block ID.
            The source language is: ${sourceLanguageName}.
            The target language name is: ${requestedLanguageName}.
            
            Overall journey analysis:
            ${journeyAnalysis}
            
            Card content:
            ${cardContent}
            
            Please analyze:
            1. How does this card relate to the overall journey intent?
            2. What is the specific purpose of this card?
            3. What emotion or action is this card trying to evoke?
            4. Any cultural considerations for translating this card to ${requestedLanguageName}?
            
            Provide a concise analysis that will help inform translation decisions.
          `

              const { text: cardAnalysis } = await generateText({
                model: google('gemini-2.0-flash'),
                prompt: cardAnalysisPrompt,
                onStepFinish: ({ usage }) => {
                  console.log('usage', usage)
                }
              })

              if (cardAnalysis) {
                console.log(`Successfully analyzed card ${cardBlock.id}`)

                await translateCardBlock({
                  blocks: journey.blocks,
                  cardBlock,
                  cardAnalysis,
                  sourceLanguageName,
                  targetLanguageName: requestedLanguageName
                })
              }
            } catch (analysisError) {
              console.error(
                `Error analyzing card ${cardBlock.id}:`,
                analysisError
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
