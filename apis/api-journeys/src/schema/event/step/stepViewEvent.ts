import { builder } from '../../builder'
import { EventInterface } from '../event'

export const StepViewEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'StepViewEvent',
  isTypeOf: (obj: any) => obj.typename === 'StepViewEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})
