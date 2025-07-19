import { builder } from '../../../builder'

export const VideoTriggerBlockCreateInput = builder.inputType(
  'VideoTriggerBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({
        required: false,
        description:
          'ID should be unique Response UUID (Provided for optimistic mutation result matching)'
      }),
      parentBlockId: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      triggerStart: t.int({ required: true })
    })
  }
)
