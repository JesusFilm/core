import { builder } from '../../../builder'

export const VideoTriggerBlockUpdateInput = builder.inputType(
  'VideoTriggerBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      triggerStart: t.int({ required: false })
    })
  }
)
