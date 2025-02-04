import { createSchema } from 'graphql-yoga'

import { ai } from '../../scripts/ai'
import { builder } from '../builder'

const Journey = builder.prismaObject('Journey', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description')
  }),
  shareable: true
})

builder.queryField('generateJourney', (t) =>
  t.field({
    type: Journey,
    smartSubscription: true,
    args: {
      userInput: t.arg.string({ required: true })
    },
    subscribe: (subscriptions, journey, args, ctx, info) => {
      subscriptions.register(`generateJourney/${journey.id}`)
    },
    resolve: async (_parent, { userInput }) => {
      return await ai(userInput)
    }
  })
)

export const schema = createSchema({
  typeDefs: builder.toSchema()
})
