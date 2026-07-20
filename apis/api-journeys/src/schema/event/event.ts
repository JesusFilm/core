import { GraphQLError } from 'graphql'

import { builder } from '../builder'

export const EventInterface = builder.prismaInterface('Event', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    journeyId: t.field({
      type: 'ID',
      nullable: false,
      select: {
        journeyId: true
      },
      resolve: ({ journeyId }) => {
        if (!journeyId) {
          throw new GraphQLError('Journey ID is required')
        }
        return journeyId
      }
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true })
  })
})
