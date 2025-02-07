import { createSchema } from 'graphql-yoga'

import { AiJourneyGenerator } from '../../services/ai-journey-generator'
import { JourneyGenerationInput } from '../ai/journey-generation.types'
import { builder } from '../builder'

const aiGenerator = new AiJourneyGenerator()

builder.queryField('generateJourney', (t) =>
  t.field({
    type: 'String',
    args: {
      input: t.arg({
        type: builder.inputType('JourneyGenerationInput', {
          fields: (t) => ({
            theme: t.string({ required: true }),
            targetAudience: t.string({ required: true }),
            mainMessage: t.string({ required: true }),
            language: t.string({ required: true, defaultValue: '529' }),
            additionalContext: t.string(),
            systemPrompt: t.string()
          })
        })
      })
    },
    resolve: async (_parent, { input }) => {
      if (!input) {
        throw new Error('Input is required')
      }

      const journeyInput: JourneyGenerationInput = {
        theme: input.theme,
        targetAudience: input.targetAudience,
        mainMessage: input.mainMessage,
        language: input.language,
        additionalContext: input.additionalContext ?? '',
        systemPrompt: input.systemPrompt ?? ''
      }

      const result = await aiGenerator.generateJourney(journeyInput)
      return JSON.stringify(result)
    }
  })
)

export const schema = createSchema({
  typeDefs: builder.toSchema()
})
