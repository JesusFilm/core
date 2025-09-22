import { builder } from '../../builder'
import { EventInterface } from '../event'

export const StepNextEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'StepNextEvent',
  isTypeOf: (obj: any) => obj.typename === 'StepNextEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})
