import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const VideoTriggerBlockCreateInput = builder.inputType(
  'VideoTriggerBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      eventLabel: t.field({ type: EventLabel, required: false }),
      triggerStart: t.int({
        required: false,
        description:
          'triggerStart sets the time as to when a video navigates to the next block, this is the number of seconds since the start of the video'
      })
    })
  }
)
