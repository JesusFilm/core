import { createSchema } from 'graphql-yoga'

import { AiJourneyGenerator } from '../../services/ai-journey-generator'
import { JourneyGenerationInput } from '../ai/journey-generation.types'
import { builder } from '../builder'

const aiGenerator = new AiJourneyGenerator()

builder.queryField('generateJourney', (t) =>
  t.field({
    // TODO: return Journey object or Block objects
    type: 'String',
    args: {
      input: t.arg({
        type: builder.inputType('JourneyGenerationInput', {
          fields: (t) => ({
            theme: t.string({ required: true }),
            targetAudience: t.string({ required: true }),
            mainMessage: t.string({ required: true }),
            language: t.string({ required: true, defaultValue: '529' }),
            additionalContext: t.string()
          })
        })
      })
    },
    resolve: async (_parent, { input }) => {
      if (!input) {
        throw new Error('Input is required')
      }
      if (input.additionalContext == null) {
        input.additionalContext = 'no additional context'
      }

      const journeyInput: JourneyGenerationInput = {
        theme: input.theme,
        targetAudience: input.targetAudience,
        mainMessage: input.mainMessage,
        language: input.language,
        additionalContext: input.additionalContext
      }

      const result = await aiGenerator.generateJourney(journeyInput)
      return JSON.stringify(result)
    }
  })
)

export const schema = createSchema({
  typeDefs: builder.toSchema()
})
