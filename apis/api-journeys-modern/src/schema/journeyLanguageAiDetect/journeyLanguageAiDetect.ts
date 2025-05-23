import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

builder.mutationFields((t) => ({
  journeyLanguageAiDetect: t
    .withAuth({ isAuthenticated: true })
    .fieldWithInput({
      input: {
        journeyId: t.input.id({ required: true }),
        name: t.input.string({ required: true }),
        journeyLanguageName: t.input.string({ required: true }),
        textLanguageId: t.input.id({ required: true }),
        textLanguageName: t.input.string({ required: true })
      },
      type: 'Boolean',
      nullable: false,
      resolve: async (_root, { input }, { user }) => {
        const journey = await prisma.journey.findUnique({
          where: { id: input.journeyId },
          include: {
            blocks: {
              where: {
                typename: 'TypographyBlock'
              },
              select: {
                content: true
              },
              take: 5
            }
          }
        })

        if (!journey) {
          throw new Error('Journey not found')
        }

        const sourceLanguageName = input.journeyLanguageName
        const requestedLanguageName = input.textLanguageName
        const journeyContent = journey.blocks
          .map((block) => block.content)
          .join('\n')

        const languageDetectionPrompt = `
      Detect the language and writing system of the following content.
      Do not just look at the individual words or characters but the whole sentences to determine the language.
      We think the content is in ${sourceLanguageName}.
      The requested content is ${requestedLanguageName}.
      
      When determining if the language of the content provided is Simplified Chinese or Traditional Chinese, always consider the following:
      - For Chinese, determine whether the characters are from the Simplified set (used in Mainland China/Singapore) or the Traditional set (used in Taiwan/Hong Kong/Macau).
      - Consider "Simplified Chinese" and "Traditional Chinese" as distinct for comparison, even though they share the same spoken language base.
    
      Only apply the following logic if the detected language is Simplified Chinese or Traditional Chinese:
      - If the detected language is Simplified Chinese:
        - And the ${requestedLanguageName} is 華語, then always return isSameLanguage as false.
        - And the ${requestedLanguageName} is 中文, then always return isSameLanguage as true.
      - If the detected language is Traditional Chinese:
        - And the ${requestedLanguageName} is 華語, then always return isSameLanguage as true.
        - And the ${requestedLanguageName} is 中文, then always return isSameLanguage as false.
      For languages that use the western alphabet, do not assume the detected language is English.
      Instead, analyze the content to determine the language.
      Content: ${journeyContent}
      Return the result in this exact JSON format:
      {
        language: [e.g. "Traditional Chinese", "Simplified Chinese", "Japanese", "English"],
        isSameLanguage: [whether the detected language is the same as the requested language]
      }`

        try {
          const { object: detectedLanguage } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: z.object({
              language: z.string(),
              isSameLanguage: z.boolean()
            }),
            prompt: languageDetectionPrompt
          })
          return detectedLanguage.isSameLanguage
        } catch {
          throw new Error('Error detecting language with AI')
        }
      }
    })
}))
