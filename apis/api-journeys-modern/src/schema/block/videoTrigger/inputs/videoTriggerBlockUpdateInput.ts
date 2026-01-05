import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const VideoTriggerBlockUpdateInput = builder.inputType(
  'VideoTriggerBlockUpdateInput',
  {
    fields: (t) => ({
      eventLabel: t.field({ type: EventLabel, required: false }),
      triggerStart: t.int({ required: false })
    })
  }
)
