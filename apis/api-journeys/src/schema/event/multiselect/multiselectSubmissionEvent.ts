import { builder } from '../../builder'
import { EventInterface } from '../event'

export const MultiselectSubmissionEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'MultiselectSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectSubmissionEvent',
  fields: (t) => ({
    // For this event type, GraphQL schema expects an array of strings under `value`.
    // We expose `value` as a list by splitting the stored string if needed at resolver level.
    // The field is part of the EventInterface as a string, so no extra unique fields here.
  })
})
