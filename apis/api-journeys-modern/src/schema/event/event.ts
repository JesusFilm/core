import { builder } from '../builder'

// Define Event interface
export const EventInterface = builder.prismaInterface('Event', {
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true })
  })
})
