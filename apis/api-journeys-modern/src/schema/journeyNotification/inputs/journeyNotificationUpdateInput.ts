import { builder } from '../../builder'

export const JourneyNotificationUpdateInput = builder.inputType(
  'JourneyNotificationUpdateInput',
  {
    fields: (t) => ({
      journeyId: t.id({ required: true }),
      visitorInteractionEmail: t.boolean({ required: true })
    })
  }
)
