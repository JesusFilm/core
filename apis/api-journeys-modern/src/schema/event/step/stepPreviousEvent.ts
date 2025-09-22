import { builder } from '../../builder'
import { EventInterface } from '../event'

export const StepPreviousEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'StepPreviousEvent',
  isTypeOf: (obj: any) => obj.typename === 'StepPreviousEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})
