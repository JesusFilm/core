import { builder } from '../../builder'
import { EventInterface } from '../event'

// RadioQuestionSubmissionEvent type
export const RadioQuestionSubmissionEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'RadioQuestionSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'RadioQuestionSubmissionEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})
