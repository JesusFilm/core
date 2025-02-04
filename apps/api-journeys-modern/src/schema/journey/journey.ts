import { createSchema } from 'graphql-yoga'

import { ai } from '../../scripts/ai'
import { builder } from '../builder'

builder.queryField('generateJourney', (t) =>
  t.field({
    type: 'String',
    args: {
      userInput: t.arg.string({ required: true })
    },
    resolve: async (_parent, { userInput }) => {
      return await ai(userInput) // Ensure `ai` accepts input properly
    }
  })
)

export const schema = createSchema({
  typeDefs: builder.toSchema()
})
