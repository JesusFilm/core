import { createSchema } from 'graphql-yoga'

import { ai } from '../../scripts/ai'
import { builder } from '../builder'

builder.queryField('generateJourney', (t) =>
  t.field({
    type: 'String',
    args: {
      prompt: t.arg.string({ required: true }),
      system: t.arg.string({ required: true })
    },
    resolve: async (_parent, { prompt, system }) => {
      return await ai(prompt, system)
    }
  })
)

export const schema = createSchema({
  typeDefs: builder.toSchema()
})
