import { builder } from '../../builder'
import { EventInterface } from '../event'

// TextResponseSubmissionEvent type
export const TextResponseSubmissionEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'TextResponseSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'TextResponseSubmissionEvent',
  fields: (t) => ({
    blockId: t.exposeString('blockId', { nullable: true })
  })
})
