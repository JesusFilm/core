import { builder } from '../../../builder'

export const VideoTriggerBlockUpdateInput = builder.inputType(
  'VideoTriggerBlockUpdateInput',
  {
    fields: (t) => ({
      triggerStart: t.int({ required: false })
    })
  }
)
